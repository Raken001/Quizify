import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Authentication Service
 * 
 * Manages user authentication including login, registration, and logout
 * Provides observable to track authentication state changes
 * Components can subscribe to authStateChanged$ to react to login/logout events
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/auth';
  private tokenKey = 'quizify_token';
  
  // Observable that emits when auth state changes (true = logged in, false = logged out)
  private authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authStateChanged$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Register a new user account
   * @param data - Registration payload (email, password, firstName, lastName)
   */
  async register(data: RegisterPayload): Promise<void> {
    await this.http.post(`${this.api}/register`, data).toPromise();
  }

  /**
   * Login user with email and password
   * Stores token and emits auth state change event
   * @param data - Login payload (email, password)
   */
  async login(data: LoginPayload): Promise<void> {
    const res: any = await this.http.post(`${this.api}/login`, data).toPromise();
    if (res.token) {
      localStorage.setItem(this.tokenKey, res.token);
      // Emit auth state change to notify all subscribers
      this.authStateSubject.next(true);
    }
  }

  /**
   * Logout current user
   * Removes token and emits auth state change event
   * Redirects to login page
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    // Emit auth state change to notify all subscribers
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Gets stored authentication token
   * @returns Token string or null if not logged in
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Checks if user is currently logged in
   * @returns true if token exists, false otherwise
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
