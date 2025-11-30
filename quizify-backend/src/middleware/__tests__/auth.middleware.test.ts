import { requireAuth, requireAdmin } from '../auth.middleware';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/types';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('requireAuth', () => {
    it('should reject request without Authorization header', () => {
      requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'access denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request without Bearer scheme', () => {
      mockReq.headers = { authorization: 'Basic token' };
      requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'access denied' });
    });

    it('should reject invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid_token' };
      requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'invalid or expired token' });
    });

    it('should accept valid token and set user', () => {
      const validToken = jwt.sign(
        { userId: '123', email: 'test@example.com', role: 'user' },
        JWT_SECRET
      );
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthRequest).user).toBeDefined();
      expect((mockReq as AuthRequest).user?.userId).toBe('123');
      expect((mockReq as AuthRequest).user?.email).toBe('test@example.com');
      expect((mockReq as AuthRequest).user?.role).toBe('user');
    });

    it('should handle expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123', email: 'test@example.com', role: 'user' },
        JWT_SECRET,
        { expiresIn: '0s' }
      );
      
      // Wait a bit to ensure token is expired
      setTimeout(() => {
        mockReq.headers = { authorization: `Bearer ${expiredToken}` };
        requireAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
      }, 100);
    });
  });

  describe('requireAdmin', () => {
    it('should reject non-admin users', () => {
      const mockReqWithUser = {
        ...mockReq,
        user: { userId: '123', email: 'user@example.com', role: 'user' as const }
      };

      requireAdmin(mockReqWithUser as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'admin access required' });
    });

    it('should allow admin users', () => {
      const mockReqWithAdmin = {
        ...mockReq,
        user: { userId: '456', email: 'admin@example.com', role: 'admin' as const }
      };

      requireAdmin(mockReqWithAdmin as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
