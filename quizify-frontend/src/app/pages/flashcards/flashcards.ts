import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlashcardService } from '../../services/flashcard.service';

/**
 * Flashcards Component
 * Displays flashcards in a study mode with flip functionality
 * Allows filtering by subject and navigation between cards
 */
@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css'
})
export class Flashcards implements OnInit {
  loading = true;
  error: string | null = null;
  data: Array<{ _id?: string; id?: string; subject: string; question: string; answer: string; options?: string[] }> = [];

  index = 0;
  showAnswer = false;
  subjects: string[] = [];
  selectedSubject: string = '';

  constructor(private flashcardService: FlashcardService) {}

  /**
   * Initialize component - load subjects and initial flashcards
   */
  ngOnInit(): void {
    this.loadSubjects();
    this.loadCards();
  }

  /**
   * Loads all available subjects for filtering
   * Non-blocking operation - errors are ignored
   */
  private loadSubjects(): void {
    this.flashcardService.getSubjects().subscribe({
      next: (subs: any) => this.subjects = subs || [],
      error: () => {/* non-blocking */}
    });
  }

  /**
   * Loads flashcards based on selected subject filter
   * If no subject selected, loads all flashcards
   * Resets card index and answer visibility on load
   */
  loadCards(): void {
    this.loading = true;
    this.error = null;

    const loadRequest$ = this.selectedSubject
      ? this.flashcardService.getBySubject(this.selectedSubject)
      : this.flashcardService.getAll();

    loadRequest$.subscribe({
      next: (rows: any) => {
        // Transform and keep only fields needed for study cards
        this.data = rows.map((r: any) => ({
          _id: r._id,
          id: r.id,
          subject: r.subject,
          question: r.question,
          // Prefer canonical `answer` field
          answer: r.answer || r.correct_answer,
          options: Array.isArray(r.options) ? r.options : []
        }));
        this.loading = false;
        this.index = 0;
        this.showAnswer = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load flashcards';
        this.loading = false;
      }
    });
  }

  /**
   * Toggles the visibility of the current card's answer
   */
  flip(): void {
    this.showAnswer = !this.showAnswer;
  }

  /**
   * Moves to the next flashcard in the list
   * Wraps around to the beginning if at the end
   */
  next(): void {
    if (!this.data.length) return;
    this.index = (this.index + 1) % this.data.length;
    this.showAnswer = false;
  }

  /**
   * Moves to the previous flashcard in the list
   * Wraps around to the end if at the beginning
   */
  prev(): void {
    if (!this.data.length) return;
    this.index = (this.index - 1 + this.data.length) % this.data.length;
    this.showAnswer = false;
  }
}
