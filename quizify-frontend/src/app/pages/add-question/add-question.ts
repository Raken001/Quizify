import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      question: ['', Validators.required],
      optionsCsv: [''],        // comma-separated options (optional)
      answer: ['', Validators.required],
      difficulty: ['medium', Validators.required]
    });
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

    this.http.post('http://localhost:8000/flashcards', payload)
      .subscribe({
        next: () => {
          this.success = 'Question added!';
          this.submitting = false;
          // tiny pause then go back to list
          setTimeout(() => this.router.navigate(['/questions']), 400);
        },
        error: (err) => {
          this.error = err?.error?.error || 'Failed to add question';
          this.submitting = false;
        }
      });
  }
}
