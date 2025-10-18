import { Router, Response } from 'express';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import { AuthRequest, ProfileUpdate, PasswordChange, PreferencesUpdate } from './types.js';

const router = Router();

// GET /users/profile -> Get current user profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId)
      .select('-passwordHash')
      .lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('GET /users/profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /users/profile -> Update user profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, bio, avatar } = req.body as ProfileUpdate;
    const updateData: any = {};
    if (firstName !== undefined) updateData['profile.firstName'] = firstName;
    if (lastName !== undefined) updateData['profile.lastName'] = lastName;
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (avatar !== undefined) updateData['profile.avatar'] = avatar;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('PUT /users/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /users/password -> Change user password
router.put('/password', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body as PasswordChange;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('PUT /users/password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// GET /users/stats -> Get user statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select('stats').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user.stats);
  } catch (err) {
    console.error('GET /users/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// PUT /users/preferences -> Update user preferences
router.put('/preferences', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { dailyGoal, studyReminders, theme, notifications } = req.body as PreferencesUpdate;
    const updateData: any = {};
    if (dailyGoal !== undefined) updateData['preferences.dailyGoal'] = dailyGoal;
    if (studyReminders !== undefined) updateData['preferences.studyReminders'] = studyReminders;
    if (theme !== undefined) updateData['preferences.theme'] = theme;
    if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('PUT /users/preferences error:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
