// quizify-backend/questions.routes.js
import { Router } from 'express';
import { requireAuth } from './auth.middleware.js';
import { pool } from './db.js';

const router = Router();

// GET all questions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST add a question
router.post('/add', async (req, res) => {
  const { subject, question, options, correct_answer, difficulty_level } = req.body;

  if (!subject || !question || !options || !correct_answer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO questions (subject, question, options, correct_answer, difficulty_level)
       VALUES (?, ?, ?, ?, ?)`,
      [subject, question, JSON.stringify(options), correct_answer, difficulty_level || 1]
    );

    res.status(201).json({ id: result.insertId, subject, question, options, correct_answer, difficulty_level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// update a question
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { subject, question, options, correct_answer, difficulty_level } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE questions
         SET subject = COALESCE(?, subject),
             question = COALESCE(?, question),
             options = COALESCE(?, options),
             correct_answer = COALESCE(?, correct_answer),
             difficulty_level = COALESCE(?, difficulty_level)
       WHERE id = ?`,
      [
        subject ?? null,
        question ?? null,
        options ? JSON.stringify(options) : null,
        correct_answer ?? null,
        typeof difficulty_level === 'number' ? difficulty_level : null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /questions/update/:id error:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});


// DELETE a question by id
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
