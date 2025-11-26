import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Registration Component
 * 
 * Handles user account creation with email, password, and optional name fields
 * Validates form input and communicates with backend registration service
 * Redirects to login page on successful registration
 * Manages loading and error states during the registration process
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: [''],
      lastName: ['']
    });
  }

  /**
   * Submits registration form to authentication service
   * Validates form before submission and manages loading state
   * Redirects to login page on success, displays error on failure
   */
  async register() {
    this.error = '';
    this.loading = true;
    if (this.form.invalid) {
      this.error = 'Please fill all required fields.';
      this.loading = false;
      return;
    }
    try {
      await this.auth.register(this.form.value);
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err?.error?.error || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
