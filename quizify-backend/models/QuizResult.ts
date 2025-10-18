import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript interfaces for result breakdown
export interface ISubjectBreakdown {
  subject: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface IDifficultyBreakdown {
  difficulty: 'easy' | 'medium' | 'hard';
  correct: number;
  total: number;
  percentage: number;
}

// TypeScript interface for QuizResult document
export interface IQuizResult extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  summary: {
    score: number; // percentage 0-100
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    timeSpent: number; // in seconds
    averageTimePerQuestion: number; // in seconds
  };
  breakdown: {
    bySubject: ISubjectBreakdown[];
    byDifficulty: IDifficultyBreakdown[];
    answerSpeed: {
      fast: number; // < 5 seconds
      medium: number; // 5-15 seconds
      slow: number; // > 15 seconds
    };
  };
  completedAt: Date;
  createdAt: Date;
}

const subjectBreakdownSchema = new Schema<ISubjectBreakdown>(
  {
    subject: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { _id: false }
);

const difficultyBreakdownSchema = new Schema<IDifficultyBreakdown>(
  {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { _id: false }
);

const quizResultSchema = new Schema<IQuizResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuizSession',
      required: true,
      unique: true
    },
    summary: {
      score: { type: Number, required: true, min: 0, max: 100 },
      totalQuestions: { type: Number, required: true },
      correctAnswers: { type: Number, required: true },
      incorrectAnswers: { type: Number, required: true },
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F'],
        required: true
      },
      timeSpent: { type: Number, required: true },
      averageTimePerQuestion: { type: Number, required: true }
    },
    breakdown: {
      bySubject: [subjectBreakdownSchema],
      byDifficulty: [difficultyBreakdownSchema],
      answerSpeed: {
        fast: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        slow: { type: Number, default: 0 }
      }
    },
    completedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common queries
quizResultSchema.index({ userId: 1, completedAt: -1 });
quizResultSchema.index({ userId: 1, 'summary.score': -1 });
quizResultSchema.index({ sessionId: 1 });

const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);

export default QuizResult;
