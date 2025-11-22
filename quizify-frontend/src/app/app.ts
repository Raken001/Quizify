import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('quizify-frontend');

  health: unknown = null;

  // ADD THIS FIELD
  me: unknown = null;

  // INJECT HTTP CLIENT
  constructor(private http: HttpClient) {}

  // FETCH BACKEND HEALTH ON LOAD
  ngOnInit() {
    this.http.get('http://localhost:8000/health')
      .subscribe(res => this.health = res);
  }

  // ⬇DD THIS METHOD (used by the button in app.html)
  fetchMe() {
    this.http.get('http://localhost:8000/me').subscribe({
      next: res => this.me = res,
      error: err => this.me = err?.error || err
    });
  }
}
