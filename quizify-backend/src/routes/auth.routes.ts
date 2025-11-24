import { Router, Response } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, RegisterBody, LoginBody } from '../types/types.js';

const router = Router();

/**
 * POST /auth/register
 * Body: { email, password, firstName?, lastName? }
 * - Validates input
 * - Checks if the email already exists
 * - Hashes the password (never store plain text)
 * - Inserts the user into MongoDB
 * - Returns a JWT token the frontend can store and use
 */
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body as RegisterBody;
    
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    // Validate email format
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'invalid email format' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }

    // Is this email already registered?
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'email already registered' });
      return;
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with optional profile fields
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      profile: {
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    });

    // Create a JWT (contains userId + email + role)
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(
      { 
        userId: String(user._id), 
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn: '30m' } as jwt.SignOptions
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        profile: user.profile
      } 
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'server error' });
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
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;
    
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }

    // Compare plain password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }

    // Sign a new token
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(
      { 
        userId: String(user._id), 
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn: '30m' } as jwt.SignOptions
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        profile: user.profile,
        stats: user.stats
      } 
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
