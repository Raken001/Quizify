import { Router, Response } from 'express';
import User from './models/User.js';
import Flashcard from './models/Flashcard.js';
import QuizResult from './models/QuizResult.js';
import SystemStats from './models/SystemStats.js';
import { AuthRequest } from './types.js';
import { requireAdmin } from './auth.middleware.js';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /admin/stats -> System-wide statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let stats = await SystemStats.findOne({ date: today });
    if (!stats) {
      // Calculate stats for today
      const activeUsers = await User.countDocuments({ 'stats.lastStudyDate': { $gte: today } });
      const newUsers = await User.countDocuments({ createdAt: { $gte: today } });
      const totalFlashcards = await Flashcard.countDocuments();
      const completedQuizzes = await QuizResult.countDocuments({ completedAt: { $gte: today } });
      const results = await QuizResult.find({ completedAt: { $gte: today } }).select('summary.score').lean();
      const averageQuizScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.summary.score || 0), 0) / results.length) : 0;
      stats = await SystemStats.create({
        date: today,
        stats: {
          totalUsers: await User.countDocuments(),
          activeUsers,
          newUsers,
          totalFlashcards,
          newFlashcards: 0, // Not tracked in this example
          totalQuizzes: await QuizResult.countDocuments(),
          completedQuizzes,
          averageQuizScore,
          totalStudyTime: 0 // Not tracked in this example
        }
      });
    }
    // Also get overall system stats
    const totalUsers = await User.countDocuments();
    const totalFlashcards = await Flashcard.countDocuments();
    const totalQuizzes = await QuizResult.countDocuments();
    res.json({
      today: stats,
      overall: {
        totalUsers,
        totalFlashcards,
        totalQuizzes
      }
    });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /admin/users -> User management with pagination
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, role } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const query: any = {};
    if (search) query.email = { $regex: search, $options: 'i' };
    if (role) query.role = role;
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    const total = await User.countDocuments(query);
    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /admin/users/:id/role -> Change user role
router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
      return;
    }
    // Prevent changing own role
    if (id === req.user?.userId) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('PUT /admin/users/:id/role error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// DELETE /admin/users/:id -> Delete user account
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Prevent deleting own account
    if (id === req.user?.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Also delete user's flashcards and quiz data
    await Flashcard.deleteMany({ userId: id });
    await QuizResult.deleteMany({ userId: id });
    res.json({ message: 'User deleted successfully', deletedId: id });
  } catch (err) {
    console.error('DELETE /admin/users/:id error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /admin/logs -> System activity logs (placeholder)
router.get('/logs', async (_req: AuthRequest, res: Response) => {
  try {
    // This would integrate with a logging system
    // For now, return recent user activity
    const recentUsers = await User.find()
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('email role stats.lastStudyDate updatedAt')
      .lean();
    res.json({
      message: 'Logs endpoint - would integrate with logging system',
      recentActivity: recentUsers
    });
  } catch (err) {
    console.error('GET /admin/logs error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /admin/backup -> Trigger database backup (placeholder)
router.post('/backup', async (req: AuthRequest, res: Response) => {
  try {
    // This would trigger actual backup process
    // For now, just log the request
    console.log('Backup requested by admin:', req.user?.email);
    res.json({ 
      message: 'Backup initiated',
      timestamp: new Date(),
      note: 'This would trigger actual backup in production'
    });
  } catch (err) {
    console.error('POST /admin/backup error:', err);
    res.status(500).json({ error: 'Failed to initiate backup' });
  }
});

export default router;
