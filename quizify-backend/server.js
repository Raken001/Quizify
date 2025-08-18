import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth.routes.js';
import flashcardsRoutes from './flashcards.routes.js';


import { requireAuth } from './auth.middleware.js';
import { connectMongo } from './mongo.js';


const app = express();

// basic middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

// health check (used to verify the server is alive)
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'quizify-backend' });
});

app.use('/auth', authRoutes);

app.use('/questions',requireAuth, flashcardsRoutes);

app.use('/flashcards', requireAuth, flashcardsRoutes);



// PROTECTED ROUTE
app.get('/me', requireAuth, (req, res) => {
  // req.user was set by requireAuth
  res.json({ userId: req.user.userId, email: req.user.email });
});

// temporary root route (so you can open http://localhost:8000 in a browser)
app.get('/', (req, res) => {
  res.send('Quizify backend is running. Try GET /health');
});

connectMongo().catch(() => {
  // we’ll still let the server start, but you’ll see an error if Mongo isn’t up
  console.warn('⚠️  Continuing without Mongo connection.');
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
