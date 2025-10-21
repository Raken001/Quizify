import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css'
})
export class AddQuestion implements OnInit {
  form!: FormGroup;
  submitting = false;
  error: string | null = null;
  success: string | null = null;
  isEdit = false;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      question: ['', Validators.required],
      optionsCsv: [''],        // comma-separated options (optional)
      answer: ['', Validators.required],
      difficulty: ['medium', Validators.required]
    });

    // Detect edit mode
    this.editingId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editingId;
    if (this.isEdit && this.editingId) {
      this.http.get<any>(`http://localhost:8000/flashcards/${this.editingId}`).subscribe({
        next: (q) => {
          const optionsCsv = Array.isArray(q.tags) ? q.tags.join(', ') : '';
          this.form.patchValue({
            subject: q.subject || '',
            question: q.question || '',
            optionsCsv,
            answer: q.answer || '',
            difficulty: q.difficulty || 'medium'
          });
        },
        error: (err) => {
          this.error = err?.error?.error || 'Failed to load question';
        }
      });
    }
  }

  submit(): void {
    this.error = null;
    this.success = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fill all fields.';
      return;
    }

    this.submitting = true;

    const { subject, question, optionsCsv, answer, difficulty } = this.form.value;

    // transform "a, b, c" -> ["a","b","c"] (only if options provided)
    const tags = optionsCsv 
      ? String(optionsCsv)
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      : [];

    const payload = {
      subject,
      question,
      answer,
      difficulty,
      tags
    };

    const req$ = this.isEdit && this.editingId
      ? this.http.put(`http://localhost:8000/flashcards/${this.editingId}`, payload)
      : this.http.post('http://localhost:8000/flashcards', payload);

    req$.subscribe({
      next: () => {
        this.success = this.isEdit ? 'Question updated!' : 'Question added!';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/questions']), 400);
      },
      error: (err) => {
        this.error = err?.error?.error || (this.isEdit ? 'Failed to update question' : 'Failed to add question');
        this.submitting = false;
      }
    });
  }
}
