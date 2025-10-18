import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private api = 'http://localhost:8000/flashcards';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.api);
  }

  add(flashcard: any) {
    return this.http.post(this.api, flashcard);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
