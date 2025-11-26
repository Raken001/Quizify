import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlashcardService } from '../../services/flashcard.service';

/**
 * Questions Component
 * Displays all flashcards (questions) in a table format
 * Allows users to view, edit, and delete flashcards
 */
@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './questions.html',
  styleUrl: './questions.css'
})
export class Questions implements OnInit {
  loading = true;
  error: string | null = null;
  data: any[] = [];

  constructor(private flashcardService: FlashcardService) {}

  /**
   * Initialize component - load all flashcards on creation
   */
  ngOnInit(): void {
    this.refresh();
  }

  /**
   * Loads/reloads all flashcards from the backend
   * Handles loading and error states
   */
  refresh(): void {
    this.loading = true;
    this.error = null;

    this.flashcardService.getAll().subscribe({
      next: (rows: any) => {
        this.data = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load questions';
        this.loading = false;
      }
    });
  }

  /**
   * Converts difficulty level to readable label
   * @param row - Flashcard row data
   * @returns Difficulty label (easy, medium, hard, or -)
   */
  difficultyLabel(row: any): string {
    if (row?.difficulty) return row.difficulty;
    const lvl = Number(row?.difficulty_level);
    if (lvl === 1) return 'easy';
    if (lvl === 2) return 'medium';
    if (lvl === 3) return 'hard';
    return '-';
  }

  /**
   * Deletes a flashcard with confirmation
   * Updates UI immediately after deletion
   * @param id - Flashcard ID to delete
   */
  delete(id: string): void {
    if (!id) return;
    if (!confirm('Delete this flashcard?')) return;

    this.flashcardService.delete(id).subscribe({
      next: () => {
        // Update UI instantly without full reload
        this.data = this.data.filter(x => (x._id || x.id) !== id);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Delete failed';
      }
    });
  }
}
