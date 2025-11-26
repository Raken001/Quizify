import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;

  constructor(public auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
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
      error: (err: any) => {
        this.error = err?.error?.error || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
