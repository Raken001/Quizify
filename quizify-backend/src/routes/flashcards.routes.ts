import { Router, Response } from 'express';
import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';
import { AuthRequest, FlashcardQuery } from '../types/types.js';

const router = Router();

// GET /flashcards  -> list user's flashcards with optional filtering
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, tags, difficulty, search } = req.query as FlashcardQuery;
    
    // Build query
    const query: any = { userId };
    if (subject) query.subject = subject;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    const cards = await Flashcard.find(query).sort({ createdAt: -1 }).lean();
    res.json(cards);
  } catch (err) {
    console.error('GET /flashcards error:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// GET /flashcards/subjects -> get unique subjects for current user
router.get('/subjects', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const subjects = await Flashcard.distinct('subject', { userId });
    res.json(subjects);
  } catch (err) {
    console.error('GET /flashcards/subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /flashcards/tags -> get unique tags for current user
router.get('/tags', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tags = await Flashcard.distinct('tags', { userId });
    res.json(tags);
  } catch (err) {
    console.error('GET /flashcards/tags error:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /flashcards/:id -> get single flashcard
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const card = await Flashcard.findOne({ _id: id, userId }).lean();
    if (!card) {
      res.status(404).json({ error: 'Flashcard not found' });
      return;
    }
    res.json(card);
  } catch (err) {
    console.error('GET /flashcards/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
});

// POST /flashcards -> create a flashcard
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    // Accept both legacy and bulk-import shapes
    const body: any = req.body || {};
    const subject = body.subject;
    const question = body.question;
    const answer = body.answer || body.correct_answer;
    // tags or options as tags
    const tags = Array.isArray(body.tags) ? body.tags : (Array.isArray(body.options) ? body.options : []);
    // difficulty string or numeric difficulty_level
    let difficulty = body.difficulty as any;
    if (!difficulty && body.difficulty_level !== undefined) {
      const lvl = Number(body.difficulty_level);
      difficulty = lvl === 1 ? 'easy' : lvl === 2 ? 'medium' : lvl === 3 ? 'hard' : 'medium';
    }

    if (!subject || !question || !answer) {
      res.status(400).json({ error: 'subject, question, and answer are required' });
      return;
    }
    const doc = await Flashcard.create({
      userId,
      subject,
      question,
      answer,
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : []
    });
    // Update user stats
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalFlashcards': 1 } });
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /flashcards error:', err);
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
});

// PUT /flashcards/:id -> update a flashcard
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const body: any = req.body || {};
    const question = body.question;
    const answer = body.answer || body.correct_answer;
    const subject = body.subject;
    let difficulty = body.difficulty as any;
    if (!difficulty && body.difficulty_level !== undefined) {
      const lvl = Number(body.difficulty_level);
      difficulty = lvl === 1 ? 'easy' : lvl === 2 ? 'medium' : lvl === 3 ? 'hard' : 'medium';
    }
    const tags = Array.isArray(body.tags) ? body.tags : (Array.isArray(body.options) ? body.options : undefined);
    // Verify ownership
    const existing = await Flashcard.findOne({ _id: id, userId });
    if (!existing) {
      res.status(404).json({ error: 'Flashcard not found' });
      return;
    }
    // Build update object
    const updateData: any = {};
  if (subject !== undefined) updateData.subject = subject;
  if (question !== undefined) updateData.question = question;
  if (answer !== undefined) updateData.answer = answer;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    const updated = await Flashcard.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('PUT /flashcards/:id error:', err);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// DELETE /flashcards/:id  -> remove a flashcard by ID
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const deleted = await Flashcard.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ error: 'Flashcard not found' });
      return;
    }
    // Update user stats
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalFlashcards': -1 } });
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error('DELETE /flashcards/:id error:', err);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

export default router;
