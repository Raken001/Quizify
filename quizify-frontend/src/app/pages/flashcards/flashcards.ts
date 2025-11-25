import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css'
})
export class Flashcards {
  loading = true;
  error: string | null = null;
  data: Array<{ _id?:string; id?:string; subject:string; question:string; answer:string; options?:string[] }> = [];

  index = 0;
  showAnswer = false;
  subjects: string[] = [];
  selectedSubject: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load subjects for filter dropdown
    this.http.get<string[]>('http://localhost:8000/flashcards/subjects').subscribe({
      next: (subs) => this.subjects = subs || [],
      error: () => {/* non-blocking */}
    });
    this.loadCards();
  }

  loadCards() {
    this.loading = true;
    this.error = null;
    const url = this.selectedSubject
      ? `http://localhost:8000/flashcards?subject=${encodeURIComponent(this.selectedSubject)}`
      : `http://localhost:8000/flashcards`;
    this.http.get<any[]>(url).subscribe({
      next: (rows) => {
        // keep only fields we need for cards
        this.data = rows.map(r => ({
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

  flip() { this.showAnswer = !this.showAnswer; }

  next() {
    if (!this.data.length) return;
    this.index = (this.index + 1) % this.data.length;
    this.showAnswer = false;
  }

  prev() {
    if (!this.data.length) return;
    this.index = (this.index - 1 + this.data.length) % this.data.length;
    this.showAnswer = false;
  }
}
