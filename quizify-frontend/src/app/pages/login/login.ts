import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  form!: FormGroup;                 // initialized in ngOnInit
  loading = signal(false);
  error = signal('');
  success = signal('');

  // ⬇️ add this so template can show the token
  token: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

  // TEMP: prefill to prove validity toggles
  this.form.setValue({
    email: 'test@example.com',
    password: 'pass1234'
  });

  // TEMP: log changes
  this.form.statusChanges.subscribe(s => console.log('[form status]', s));
  this.form.valueChanges.subscribe(v => console.log('[form value]', v));
  }

  // ⬇️ matches (ngSubmit)="onSubmit()" in the template
  onSubmit(): void {
    this.error.set('');
    this.success.set('');

    if (this.form.invalid) {
      this.error.set('Please enter email and password');
      // mark fields as touched so errors show
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.value;

    this.http.post<{ token: string }>('http://localhost:8000/auth/login', { email, password })
      .subscribe({
        next: (res) => {
          this.token = res.token;                          // expose to template
          localStorage.setItem('token', res.token);        // save for later API calls
          this.success.set('Logged in! Token saved.');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error || 'Login failed');
          this.loading.set(false);
        }
      });
  }
}
