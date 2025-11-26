import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

/**
 * Navbar Component
 * Displays navigation links and user information
 * Shows admin links only for users with admin role
 */
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

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  /**
   * Initialize component - load user profile on component creation
   */
  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Loads the current user's profile information
   * Sets user role, name, and stats for display in navbar
   * Handles loading and error states
   */
  private loadUserProfile(): void {
    this.userService.getProfile().subscribe({
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

  /**
   * Logs out the current user
   * Clears authentication state and redirects to login
   */
  logout(): void {
    this.auth.logout();
  }
}
