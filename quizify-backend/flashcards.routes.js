// quizify-backend/flashcards.routes.js
import { Router } from 'express';
import { Flashcard } from './models/Flashcard.js';

const router = Router();

// GET /flashcards  -> list all flashcards (Mongo)
router.get('/', async (req, res) => {
  try {
    const cards = await Flashcard.find().sort({ createdAt: -1 }).lean();
    res.json(cards);
  } catch (err) {
    console.error('GET /flashcards error:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// POST /flashcards/add  -> create a flashcard (Mongo)
router.post('/add', async (req, res) => {
  try {
    const { subject, question, options, correct_answer, difficulty_level } = req.body;

    if (!subject || !question || !correct_answer) {
      return res.status(400).json({ error: 'subject, question, and correct_answer are required' });
    }

    const doc = await Flashcard.create({
      subject,
      question,
      options: Array.isArray(options) ? options : [],
      correct_answer,
      difficulty_level: typeof difficulty_level === 'number' ? difficulty_level : 1
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /flashcards/add error:', err);
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
});

// DELETE /flashcards/:id  -> remove a flashcard by Mongo _id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Flashcard.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error('DELETE /flashcards/:id error:', err);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

export default router;
