import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for SystemStats document
export interface ISystemStats extends Document {
  date: Date;
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalFlashcards: number;
    newFlashcards: number;
    totalQuizzes: number;
    completedQuizzes: number;
    averageQuizScore: number;
    totalStudyTime: number; // in seconds
  };
  createdAt: Date;
}

const systemStatsSchema = new Schema<ISystemStats>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true
    },
    stats: {
      totalUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      totalFlashcards: { type: Number, default: 0 },
      newFlashcards: { type: Number, default: 0 },
      totalQuizzes: { type: Number, default: 0 },
      completedQuizzes: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
      totalStudyTime: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Create index for date-based queries
systemStatsSchema.index({ date: -1 });

const SystemStats = mongoose.model<ISystemStats>('SystemStats', systemStatsSchema);

export default SystemStats;
