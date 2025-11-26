import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Authentication Guard for Protected Routes
 * 
 * Verifies that user is authenticated before allowing access to protected routes
 * Redirects unauthenticated users to login page
 * 
 * Usage: Add to route's canActivate array
 * Example: { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] }
 */
export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
