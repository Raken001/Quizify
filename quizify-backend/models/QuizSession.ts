import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript interface for answer tracking
export interface IQuizAnswer {
  questionId: Types.ObjectId;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// TypeScript interface for QuizSession document
export interface IQuizSession extends Document {
  userId: Types.ObjectId;
  flashcardIds: Types.ObjectId[];
  answers: IQuizAnswer[];
  status: 'active' | 'completed' | 'abandoned';
  startTime: Date;
  endTime?: Date;
  totalTime?: number; // in seconds
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true
    },
    userAnswer: {
      type: String,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const quizSessionSchema = new Schema<IQuizSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    flashcardIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Flashcard'
      }
    ],
    answers: [quizAnswerSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true
    },
    endTime: {
      type: Date
    },
    totalTime: {
      type: Number
    },
    subject: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common queries
quizSessionSchema.index({ userId: 1, status: 1 });
quizSessionSchema.index({ userId: 1, createdAt: -1 });
quizSessionSchema.index({ status: 1, startTime: 1 });

const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);

export default QuizSession;
