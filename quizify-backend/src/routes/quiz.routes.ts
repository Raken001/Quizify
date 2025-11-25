import { Router, Response } from 'express';
import QuizSession from '../models/QuizSession.js';
import QuizResult from '../models/QuizResult.js';
import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';
import { AuthRequest } from '../types/types.js';

const router = Router();

// POST /quiz/start -> Initialize a new quiz session
router.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, difficulty, count, randomOrder } = req.body;
    const questionCount = Number(count) || 10;
    if (!questionCount || questionCount < 1) {
      res.status(400).json({ error: 'count must be at least 1' });
      return;
    }
    // Build query to fetch flashcards
    const query: any = { userId };
    if (subject && subject !== 'all') query.subject = subject;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    let flashcards = await Flashcard.find(query).lean();
    if (flashcards.length === 0) {
      res.status(404).json({ error: 'No flashcards found matching criteria' });
      return;
    }
    // Randomize if requested
    if (randomOrder !== false) {
      flashcards = flashcards.sort(() => Math.random() - 0.5);
    }
    // Limit to requested count
    const selectedCards = flashcards.slice(0, Math.min(questionCount, flashcards.length));
    const flashcardIds = selectedCards.map(c => c._id);
    // Create quiz session
    const session = await QuizSession.create({
      userId,
      flashcardIds,
      answers: [],
      status: 'active',
      startTime: new Date(),
      subject,
      difficulty
    });
    res.status(201).json({
      sessionId: session._id,
      totalQuestions: selectedCards.length,
      firstQuestion: selectedCards[0]
    });
  } catch (err) {
    console.error('POST /quiz/start error:', err);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// GET /quiz/:sessionId -> Get current quiz session state
router.get('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const session = await QuizSession.findOne({ _id: sessionId, userId })
      .populate('flashcardIds')
      .lean();
    if (!session) {
      res.status(404).json({ error: 'Quiz session not found' });
      return;
    }
    res.json(session);
  } catch (err) {
    console.error('GET /quiz/:sessionId error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz session' });
  }
});

// PUT /quiz/:sessionId/answer -> Submit an answer
router.put('/:sessionId/answer', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const { questionId, userAnswer, timeSpent } = req.body;
    if (!questionId || !userAnswer) {
      res.status(400).json({ error: 'questionId and userAnswer are required' });
      return;
    }
    const session = await QuizSession.findOne({ _id: sessionId, userId });
    if (!session) {
      res.status(404).json({ error: 'Quiz session not found' });
      return;
    }
    if (session.status !== 'active') {
      res.status(400).json({ error: 'Quiz is not active' });
      return;
    }
    // Get the flashcard to check correct answer
    const flashcard = await Flashcard.findById(questionId);
    if (!flashcard) {
      res.status(404).json({ error: 'Flashcard not found' });
      return;
    }
    // Use the canonical `answer` field from the Flashcard model.
    const correct = (flashcard as any).answer;
    // If the flashcard has no stored answer, abort — pushing an empty string
    // will fail the QuizSession schema which requires `correctAnswer`.
    if (!correct || String(correct).trim() === '') {
      console.error('PUT /quiz/:sessionId/answer error: flashcard missing answer', { questionId, flashcardId: (flashcard as any)._id });
      res.status(500).json({ error: 'Flashcard has no stored answer; cannot validate response' });
      return;
    }
    const isCorrect = String(userAnswer).toLowerCase().trim() === String(correct).toLowerCase().trim();
    // Add answer to session
    session.answers.push({
      questionId,
      userAnswer,
      correctAnswer: correct,
      isCorrect,
      timeSpent: Number(timeSpent) || 0
    });
    await session.save();
    // Update flashcard statistics
    await Flashcard.findByIdAndUpdate(questionId, {
      $inc: {
        'statistics.timesAnswered': 1,
        'statistics.timesCorrect': isCorrect ? 1 : 0
      },
      $set: { 'statistics.lastAnswered': new Date() }
    });
    // Check if quiz is complete
    const isComplete = session.answers.length >= session.flashcardIds.length;
    res.json({
      isCorrect,
      currentIndex: session.answers.length,
      totalQuestions: session.flashcardIds.length,
      isComplete
    });
  } catch (err) {
    console.error('PUT /quiz/:sessionId/answer error:', err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// POST /quiz/:sessionId/complete -> Complete quiz and generate results
router.post('/:sessionId/complete', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const session = await QuizSession.findOne({ _id: sessionId, userId })
      .populate('flashcardIds');
    if (!session) {
      res.status(404).json({ error: 'Quiz session not found' });
      return;
    }
    // Mark session as completed
    session.status = 'completed';
    session.endTime = new Date();
    await session.save();
    // Calculate results
    const totalQuestions = session.answers.length;
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    // Calculate grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    // Calculate time spent
    const timeSpent = session.endTime && session.startTime ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000) : 0;
    // Calculate average time per question
    const times = session.answers.map(a => a.timeSpent || 0);
    const averageTimePerQuestion = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    
    // Breakdown by difficulty
    // (Assume all flashcards have a difficulty field)
    const byDifficulty: any[] = [];
    const diffMap: Record<string, { correct: number; total: number; percentage: number }> = {};
    session.answers.forEach((answer, idx) => {
      const card: any = session.flashcardIds[idx];
      const diff = card.difficulty || 'medium';
      if (!diffMap[diff]) diffMap[diff] = { correct: 0, total: 0, percentage: 0 };
      diffMap[diff].total++;
      if (answer.isCorrect) diffMap[diff].correct++;
    });
    for (const diff in diffMap) {
      diffMap[diff].percentage = diffMap[diff].total > 0 ? Math.round((diffMap[diff].correct / diffMap[diff].total) * 100) : 0;
      byDifficulty.push({ difficulty: diff, ...diffMap[diff] });
    }

    // Breakdown by subject
    const bySubject: any[] = [];
    const subjMap: Record<string, { subject: string; correct: number; total: number; percentage: number }> = {};
    session.answers.forEach((answer, idx) => {
      const card: any = session.flashcardIds[idx];
      const subj = card.subject || 'General';
      if (!subjMap[subj]) subjMap[subj] = { subject: subj, correct: 0, total: 0, percentage: 0 };
      subjMap[subj].total++;
      if (answer.isCorrect) subjMap[subj].correct++;
    });
    for (const subj in subjMap) {
      subjMap[subj].percentage = subjMap[subj].total > 0 ? Math.round((subjMap[subj].correct / subjMap[subj].total) * 100) : 0;
      bySubject.push(subjMap[subj]);
    }

    // Create quiz result
    const result = await QuizResult.create({
      userId,
      sessionId,
      summary: {
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        grade,
        timeSpent,
        averageTimePerQuestion
      },
      breakdown: {
        bySubject,
        byDifficulty,
        answerSpeed: { fast: 0, medium: 0, slow: 0 } // TODO: implement
      },
      completedAt: session.endTime
    });
    // Update user stats
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.quizzesTaken': 1 },
        $set: {
          'stats.averageScore': await calculateUserAverageScore(userId!),
          'stats.lastStudyDate': new Date()
        }
      });
    }
    res.json(result);
  } catch (err) {
    console.error('POST /quiz/:sessionId/complete error:', err);
    res.status(500).json({ error: 'Failed to complete quiz' });
  }
});

// GET /quiz/results/:resultId -> Get detailed quiz results
router.get('/results/:resultId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { resultId } = req.params;
    const result = await QuizResult.findOne({ _id: resultId, userId })
      .populate({
        path: 'sessionId',
        populate: { path: 'flashcardIds' }
      })
      .lean();
    if (!result) {
      res.status(404).json({ error: 'Quiz result not found' });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error('GET /quiz/results/:resultId error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz result' });
  }
});

// Helper function to calculate user's average score
async function calculateUserAverageScore(userId: string): Promise<number> {
  const results = await QuizResult.find({ userId }).select('summary.score').lean();
  if (results.length === 0) return 0;
  const totalScore = results.reduce((sum, r) => sum + (r.summary.score || 0), 0);
  return Math.round(totalScore / results.length);
}

export default router;
