import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript interface for Flashcard document
export interface IFlashcard extends Document {
  userId: Types.ObjectId;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  statistics: {
    timesAnswered: number;
    timesCorrect: number;
    lastAnswered?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    statistics: {
      timesAnswered: { type: Number, default: 0 },
      timesCorrect: { type: Number, default: 0 },
      lastAnswered: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// Create compound indexes for common queries
flashcardSchema.index({ userId: 1, subject: 1 });
flashcardSchema.index({ userId: 1, difficulty: 1 });
flashcardSchema.index({ userId: 1, tags: 1 });
flashcardSchema.index({ userId: 1, createdAt: -1 });

// Text index for search functionality
flashcardSchema.index({ question: 'text', answer: 'text' });

const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);

export default Flashcard;
