import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import flashcardsRoutes from './routes/flashcards.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import usersRoutes from './routes/users.routes';
import adminRoutes from './routes/admin.routes';
import { requireAuth } from './middleware/auth.middleware.js';
import { connectMongo } from './config/mongo.js';

const app = express();

// Basic middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);

// Health check endpoint with detailed status
app.get('/health', async (_req: Request, res: Response) => {
  const health = {
    ok: true,
    service: 'quizify-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(health);
});

// Public routes
app.use('/auth', authRoutes);

// Protected routes - require authentication
app.use('/flashcards', requireAuth, flashcardsRoutes);
app.use('/questions', requireAuth, flashcardsRoutes); // Alias for backward compatibility
app.use('/quiz', requireAuth, quizRoutes);
app.use('/users', requireAuth, usersRoutes);
app.use('/admin', requireAuth, adminRoutes);

// Get current user info
app.get('/me', requireAuth, (req: Request, res: Response) => {
  // req.user is set by requireAuth, but not typed on base Request
  // @ts-ignore
  const user = req.user;
  res.json({ 
    userId: user?.userId, 
    email: user?.email,
    role: user?.role 
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Quizify API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      flashcards: '/flashcards',
      quiz: '/quiz',
      users: '/users',
      admin: '/admin'
    }
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
connectMongo()
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('⚠️  MongoDB connection error:', err);
    console.warn('⚠️  Continuing without Mongo connection.');
  });

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
