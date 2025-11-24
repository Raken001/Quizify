import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// Query parameters for flashcard filtering
export interface FlashcardQuery {
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string | string[];
  search?: string;
  page?: string;
  limit?: string;
}

// Query parameters for quiz start
export interface QuizStartQuery {
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: string;
}

// Request body for answer submission
export interface AnswerSubmission {
  questionId: string;
  userAnswer: string;
  timeSpent?: number;
}

// Request body for profile update
export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

// Request body for password change
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

// Request body for preferences update
export interface PreferencesUpdate {
  dailyGoal?: number;
  studyReminders?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

// Request body for user registration
export interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Request body for user login
export interface LoginBody {
  email: string;
  password: string;
}

// Request body for flashcard creation/update
export interface FlashcardBody {
  question: string;
  answer: string;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

// Admin query parameters for user list
export interface AdminUserQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: 'user' | 'admin';
}

// Admin request body for role change
export interface RoleChangeBody {
  role: 'user' | 'admin';
}
