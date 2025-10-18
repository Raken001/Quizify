import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for User document
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  preferences: {
    dailyGoal?: number;
    studyReminders?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
  stats: {
    totalFlashcards: number;
    quizzesTaken: number;
    averageScore: number;
    studyStreak: number;
    lastStudyDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatar: { type: String },
      bio: { type: String, maxlength: 500 }
    },
    preferences: {
      dailyGoal: { type: Number, default: 20 },
      studyReminders: { type: Boolean, default: true },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false }
      }
    },
    stats: {
      totalFlashcards: { type: Number, default: 0 },
      quizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      studyStreak: { type: Number, default: 0 },
      lastStudyDate: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
