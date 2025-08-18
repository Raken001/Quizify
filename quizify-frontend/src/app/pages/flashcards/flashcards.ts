import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css'
})
export class Flashcards {
  loading = true;
  error: string | null = null;
  data: Array<{ id:number; subject:string; question:string; correct_answer:string }> = [];

  index = 0;
  showAnswer = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8000/flashcards').subscribe({
      next: (rows) => {
        // keep only fields we need for cards
        this.data = rows.map(r => ({
          id: r.id,
          subject: r.subject,
          question: r.question,
          correct_answer: r.correct_answer
        }));
        this.loading = false;
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
