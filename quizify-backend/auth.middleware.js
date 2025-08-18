// quizify-backend/auth.middleware.js
import jwt from 'jsonwebtoken';

/**
 * requireAuth
 * - Reads "Authorization: Bearer <token>"
 * - Verifies the JWT
 * - If valid, sets req.user = { userId, email } and continues
 * - If missing/invalid, responds 401
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'access denied' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}
