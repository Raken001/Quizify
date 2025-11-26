import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * FlashcardService
 * Manages all flashcard-related API operations
 * Handles CRUD operations for flashcards and subject filtering
 */
@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private api = 'http://localhost:8000/flashcards';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all flashcards
   * @returns Observable containing array of all flashcards
   */
  getAll() {
    return this.http.get(this.api);
  }

  /**
   * Fetches a single flashcard by ID
   * Used when editing an existing flashcard
   * @param id - Flashcard ID to fetch
   * @returns Observable containing the flashcard data
   */
  getById(id: string) {
    return this.http.get(`${this.api}/${id}`);
  }

  /**
   * Creates a new flashcard
   * @param flashcard - Flashcard data to create (question, answer, subject, difficulty, options)
   * @returns Observable containing the created flashcard with ID
   */
  add(flashcard: any) {
    return this.http.post(this.api, flashcard);
  }

  /**
   * Updates an existing flashcard
   * @param id - Flashcard ID to update
   * @param flashcard - Updated flashcard data
   * @returns Observable containing the updated flashcard
   */
  update(id: string, flashcard: any) {
    return this.http.put(`${this.api}/${id}`, flashcard);
  }

  /**
   * Deletes a flashcard
   * @param id - Flashcard ID to delete
   * @returns Observable containing deletion confirmation
   */
  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  /**
   * Fetches all available subjects for flashcards
   * Used for filtering and subject selection
   * @returns Observable containing array of subject names
   */
  getSubjects() {
    return this.http.get(`${this.api}/subjects`);
  }

  /**
   * Fetches flashcards filtered by subject
   * @param subject - Subject name to filter by
   * @returns Observable containing flashcards of the specified subject
   */
  getBySubject(subject: string) {
    return this.http.get(`${this.api}?subject=${encodeURIComponent(subject)}`);
  }
}

