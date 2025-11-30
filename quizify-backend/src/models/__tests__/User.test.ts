import mongoose from 'mongoose';
import { userSchema } from '../../models/User';

describe('User Model', () => {
  const User = mongoose.model('User', userSchema);

  describe('Email validation', () => {
    it('should require email field', () => {
      const userDoc = new User({
        passwordHash: 'hashedPassword',
        role: 'user'
      });

      expect(userDoc.validateSync()).toBeDefined();
    });

    it('should enforce unique email', async () => {
      // This would require a real database connection
      // For unit tests, we validate the schema definition
      const emailField = userSchema.path('email');
      expect(emailField.options.unique).toBe(true);
      expect(emailField.options.required).toBe(true);
    });

    it('should store email as lowercase', () => {
      const emailField = userSchema.path('email');
      expect(emailField.options.lowercase).toBe(true);
    });
  });

  describe('Role field', () => {
    it('should have user as default role', () => {
      const userDoc = new User({
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      });

      expect(userDoc.role).toBe('user');
    });

    it('should only accept valid roles', () => {
      const roleField = userSchema.path('role');
      expect(roleField.options.enum).toEqual(['user', 'admin']);
    });
  });

  describe('Profile fields', () => {
    it('should have optional profile fields', () => {
      const userDoc = new User({
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'avatar.jpg',
          bio: 'Bio text'
        }
      });

      expect(userDoc.profile.firstName).toBe('John');
      expect(userDoc.profile.lastName).toBe('Doe');
      expect(userDoc.profile.avatar).toBe('avatar.jpg');
      expect(userDoc.profile.bio).toBe('Bio text');
    });

    it('should limit bio to 500 characters', () => {
      const bioField = userSchema.path('profile.bio');
      expect(bioField.options.maxlength).toBe(500);
    });
  });

  describe('Stats fields', () => {
    it('should have default stats values', () => {
      const userDoc = new User({
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      });

      expect(userDoc.stats.totalFlashcards).toBe(0);
      expect(userDoc.stats.quizzesTaken).toBe(0);
      expect(userDoc.stats.averageScore).toBe(0);
      expect(userDoc.stats.studyStreak).toBe(0);
    });
  });

  describe('Preferences fields', () => {
    it('should have default preference values', () => {
      const userDoc = new User({
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      });

      expect(userDoc.preferences.dailyGoal).toBe(20);
      expect(userDoc.preferences.studyReminders).toBe(true);
      expect(userDoc.preferences.theme).toBe('auto');
      expect(userDoc.preferences.notifications?.email).toBe(true);
      expect(userDoc.preferences.notifications?.push).toBe(false);
    });

    it('should only accept valid theme values', () => {
      const themeField = userSchema.path('preferences.theme');
      expect(themeField.options.enum).toEqual(['light', 'dark', 'auto']);
    });
  });
});
