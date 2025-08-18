import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './questions.html',
  styleUrl: './questions.css'
})
export class Questions {
  loading = true;
  error: string | null = null;
  data: any[] = [];

  constructor(private http: HttpClient) {}

  // load/reload list from Mongo-backed endpoint
  refresh() {
    this.loading = true;
    this.error = null;

    this.http.get<any[]>('http://localhost:8000/flashcards').subscribe({
      next: (rows) => {
        this.data = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load questions';
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.refresh();
  }

  // delete one flashcard by _id (or id fallback)
  delete(id: string) {
    if (!id) return;
    if (!confirm('Delete this flashcard?')) return;

    this.http.delete(`http://localhost:8000/flashcards/${id}`).subscribe({
      next: () => {
        // update UI instantly without full reload
        this.data = this.data.filter(x => (x._id || x.id) !== id);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Delete failed';
      }
    });
  }
}
