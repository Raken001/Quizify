// quizify-backend/models/Flashcard.js
import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], default: [] },      // ["3","4","5"]
    correct_answer: { type: String, required: true },
    difficulty_level: { type: Number, default: 1 } // 1..5
    // could add: createdBy, tags, etc. later if you want
  },
  { timestamps: true } // createdAt, updatedAt
);

export const Flashcard = mongoose.model('Flashcard', FlashcardSchema);
