import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * QuizService
 * Manages all quiz-related API operations
 * Handles quiz sessions, answers, completion, and results retrieval
 */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private api = 'http://localhost:8000/quiz';
  private flashcardApi = 'http://localhost:8000/flashcards';

  constructor(private http: HttpClient) {}

  /**
   * Starts a new quiz session with optional filters
   * @param options - Quiz options (subject, difficulty, questionCount, etc.)
   * @returns Observable containing the new quiz session data with sessionId
   */
  start(options?: any) {
    return this.http.post(`${this.api}/start`, options || {});
  }

  /**
   * Retrieves the current quiz session data
   * @param sessionId - Quiz session ID
   * @returns Observable containing current session state and questions
   */
  getSession(sessionId: string) {
    return this.http.get(`${this.api}/${sessionId}`);
  }

  /**
   * Submits an answer for a question in the current quiz
   * @param sessionId - Quiz session ID
   * @param flashcardId - Flashcard/Question ID
   * @param answer - User's answer to the question
   * @returns Observable containing updated session with answer recorded
   */
  submitAnswer(sessionId: string, flashcardId: string, answer: string) {
    return this.http.put(`${this.api}/${sessionId}/answer`, { questionId: flashcardId, userAnswer: answer });
  }

  /**
   * Completes the quiz and records the final score
   * @param sessionId - Quiz session ID to complete
   * @returns Observable containing completion status and results summary
   */
  completeQuiz(sessionId: string) {
    return this.http.post(`${this.api}/${sessionId}/complete`, {});
  }

  /**
   * Retrieves the detailed results of a completed quiz
   * @param resultId - Quiz result ID
   * @returns Observable containing detailed quiz results (score, answers, analysis)
   */
  getResults(resultId: string) {
    return this.http.get(`${this.api}/results/${resultId}`);
  }

  /**
   * Fetches all available subjects for quiz filtering
   * @returns Observable containing array of subject names
   */
  getSubjects() {
    return this.http.get(`${this.flashcardApi}/subjects`);
  }
}

