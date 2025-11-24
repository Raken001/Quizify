import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/types.js';

// JWT Payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * requireAuth middleware
 * - Reads "Authorization: Bearer <token>"
 * - Verifies the JWT
 * - If valid, sets req.user = { userId, email, role } and continues
 * - If missing/invalid, responds 401
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'access denied' });
    return;
  }

  try {
    // Use same secret fallback as in auth.routes.ts to avoid mismatches
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret) as JWTPayload;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err: any) {
    // Provide a clearer reason to help the frontend handle it gracefully
    if (err?.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'token expired' });
      return;
    }
    res.status(401).json({ error: 'invalid or expired token' });
  }
}

/**
 * requireAdmin middleware
 * - Must be used after requireAuth
 * - Checks if user has admin role
 * - If not admin, responds 403
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'admin access required' });
    return;
  }

  next();
}
