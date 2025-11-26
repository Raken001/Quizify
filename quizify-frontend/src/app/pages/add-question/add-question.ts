import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FlashcardService } from '../../services/flashcard.service';

/**
 * AddQuestion Component
 * Provides form to create new flashcards or edit existing ones
 * Handles validation and submission of flashcard data
 */
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
    private flashcardService: FlashcardService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Initialize component - setup form and load data if editing
   */
  ngOnInit(): void {
    this.initializeForm();
    this.detectEditMode();
  }

  /**
   * Initializes the form with validators
   * Fields: subject, question, optionsCsv, answer, difficulty
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      question: ['', Validators.required],
      optionsCsv: [''],        // comma-separated options (optional)
      answer: ['', Validators.required],
      difficulty: ['medium', Validators.required]
    });
  }

  /**
   * Detects if component is in edit mode from route params
   * If editing, loads the existing flashcard data
   */
  private detectEditMode(): void {
    this.editingId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editingId;
    
    if (this.isEdit && this.editingId) {
      this.loadFlashcardForEdit(this.editingId);
    }
  }

  /**
   * Loads flashcard data for editing
   * @param id - Flashcard ID to load
   */
  private loadFlashcardForEdit(id: string): void {
    this.flashcardService.getById(id).subscribe({
      next: (q: any) => {
        const optionsCsv = Array.isArray(q.options) ? q.options.join(', ') : '';
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

  /**
   * Submits the form to create or update a flashcard
   * Validates form, transforms data, and calls appropriate service method
   */
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

    // Transform "a, b, c" -> ["a","b","c"] (only if options provided)
    const options = optionsCsv
      ? String(optionsCsv)
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      : [];

    const payload: any = { subject, question, answer, difficulty };
    if (options.length) payload.options = options;

    // Call appropriate service method based on edit mode
    const request$ = this.isEdit && this.editingId
      ? this.flashcardService.update(this.editingId, payload)
      : this.flashcardService.add(payload);

    request$.subscribe({
      next: () => {
        this.success = this.isEdit ? 'Question updated!' : 'Question added!';
        this.submitting = false;
        // Redirect to questions page after brief delay
        setTimeout(() => this.router.navigate(['/questions']), 400);
      },
      error: (err) => {
        this.error = err?.error?.error || (this.isEdit ? 'Failed to update question' : 'Failed to add question');
        this.submitting = false;
      }
    });
  }
}
