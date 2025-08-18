import { Router } from 'express';
import { pool } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * POST /auth/register
 * Body: { email, password }
 * - Validates input
 * - Checks if the email already exists
 * - Hashes the password (never store plain text)
 * - Inserts the user into MySQL
 * - Returns a JWT token the frontend can store and use
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // Is this email already registered?
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'email already registered' });
    }

    // Hash password before storing
    const password_hash = await bcrypt.hash(password, 10);

    // Store user
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash]
    );

    // Create a JWT (contains userId + email)
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({ token });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * - Validates input
 * - Looks up the user by email
 * - Compares the provided password with the stored password hash
 * - If ok, returns a JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // Find user
    const [rows] = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const user = rows[0];

    // Compare plain password with stored hash
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // Sign a new token
    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

export default router;
