import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/auth';
  private tokenKey = 'quizify_token';

  constructor(private http: HttpClient, private router: Router) {}

  async register(data: RegisterPayload): Promise<void> {
    await this.http.post(`${this.api}/register`, data).toPromise();
  }

  async login(data: LoginPayload): Promise<void> {
    const res: any = await this.http.post(`${this.api}/login`, data).toPromise();
    if (res.token) {
      localStorage.setItem(this.tokenKey, res.token);
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
