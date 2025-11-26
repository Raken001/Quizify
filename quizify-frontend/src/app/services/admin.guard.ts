import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * AdminGuard - Route Guard for Admin Routes
 * Verifies that:
 * 1. User is logged in
 * 2. User has admin role
 * 
 * If either condition fails, redirects to appropriate page
 */
export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // Check if user is logged in
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Fetch user profile to verify admin role
  return userService.getProfile().pipe(
    map((data: any) => {
      // Allow access if user is admin
      if (data.role === 'admin') {
        return true;
      } else {
        // Redirect non-admin users to home page
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      // If profile fetch fails, redirect to login
      router.navigate(['/login']);
      return of(false);
    })
  );
};

