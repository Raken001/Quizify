

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Login Component
 * 
 * Handles user authentication with email and password credentials
 * Validates form input and communicates with backend authentication service
 * Redirects to flashcards page on successful login
 * Displays error messages for failed authentication attempts
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /**
   * Submits login credentials to authentication service
   * Validates form before submission
   * Navigates to flashcards on success, displays error on failure
   */
  async onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    try {
  await this.authService.login({ email, password });
  this.router.navigate(['/flashcards']);
    } catch (err: any) {
      this.error = err?.error?.message || 'Login failed';
    }
  }
}


