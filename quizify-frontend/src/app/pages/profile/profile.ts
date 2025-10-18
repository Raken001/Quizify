import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any = null;
  error = '';
  loading = true;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Fetch full user profile from backend
    this.http.get('http://localhost:8000/users/profile').subscribe({
      next: (data: any) => {
        this.user = {
          email: data.email,
          firstName: data.profile?.firstName || '-',
          lastName: data.profile?.lastName || '-',
          role: data.role || 'user',
          stats: data.stats
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
