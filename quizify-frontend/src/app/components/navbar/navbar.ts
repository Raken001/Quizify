import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Navbar Component
 * 
 * Displays navigation links and user information
 * Shows admin links only for users with admin role
 * Automatically reloads user data when authentication state changes
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  error: string | null = null;
  private userProfileLoaded = false; // Track if profile has been loaded
  routerLinkActiveOptions = { exact: true };
  
  // Subject to unsubscribe from observables on component destroy
  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  /**
   * Initialize component
   * Loads user profile on creation
   * Subscribes to auth state changes to reload profile when user logs in/out
   */
  ngOnInit(): void {
    this.loadUserProfile();
    
    // Listen for authentication state changes (login/logout)
    // Whenever user logs in or out, reload the navbar user profile
    this.auth.authStateChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          // User logged in - reload profile to get new user's data
          this.userProfileLoaded = false; // Reset cache so profile is reloaded
          this.loadUserProfile();
        } else {
          // User logged out - clear the navbar user data
          this.user = null;
          this.userProfileLoaded = false;
          this.loading = false;
        }
      });
  }

  /**
   * Loads the current user's profile information
   * Sets user role, name, and stats for display in navbar
   * Handles loading and error states
   * Only loads once per login to avoid unnecessary API calls
   */
  private loadUserProfile(): void {
    // Skip if already loaded to prevent flicker on navigation
    if (this.userProfileLoaded && this.user) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.user = {
            email: data.email,
            firstName: data.profile?.firstName || '-',
            lastName: data.profile?.lastName || '-',
            role: data.role || 'user',
            stats: data.stats
          };
          this.userProfileLoaded = true;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err?.error?.error || 'Failed to load profile';
          this.userProfileLoaded = true;
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

  /**
   * Clean up subscriptions when component is destroyed
   * Prevents memory leaks from Observable subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
