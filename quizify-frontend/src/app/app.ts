import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';

/**
 * Root Application Component
 * 
 * Main container that wraps all routes and the navbar
 * Handles backend health checks on initialization
 * 
 * Imports:
 * - RouterOutlet: Renders routed components
 * - Navbar: Global navigation component
 * - HttpClient: For API communication
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('quizify-frontend');

  health: unknown = null;

  // Field to store current user data (used for testing)
  me: unknown = null;

  constructor(private http: HttpClient) {}

  /**
   * Initialize app on load
   * Checks backend health status to verify API connectivity
   */
  ngOnInit() {
    this.http.get('http://localhost:8000/health')
      .subscribe(res => this.health = res);
  }

  /**
   * Fetches current user information from backend
   * Used for testing/debugging authentication and user data
   */
  fetchMe() {
    this.http.get('http://localhost:8000/me').subscribe({
      next: res => this.me = res,
      error: err => this.me = err?.error || err
    });
  }
}
