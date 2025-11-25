import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private api = 'http://localhost:8000/quiz';

  constructor(private http: HttpClient) {}

  start(options?: any) {
    return this.http.post(`${this.api}/start`, options || {});
  }

  getSession(sessionId: string) {
    return this.http.get(`${this.api}/${sessionId}`);
  }

  submitAnswer(sessionId: string, flashcardId: string, answer: string) {
    return this.http.put(`${this.api}/${sessionId}/answer`, { questionId: flashcardId, userAnswer: answer });
  }

  completeQuiz(sessionId: string) {
    return this.http.post(`${this.api}/${sessionId}/complete`, {});
  }

  getResults(resultId: string) {
    return this.http.get(`${this.api}/results/${resultId}`);
  }
}
