import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';

/**
 * HTTP Authentication Interceptor
 * 
 * Automatically injects JWT token into all outgoing HTTP requests
 * Handles 401 Unauthorized responses by logging out user and redirecting to login
 * 
 * Features:
 * - Adds Authorization Bearer token to request headers
 * - Handles both browser and server-side rendering contexts
 * - Auto-logout on token expiration (401 response)
 * - Extracts error messages from server response
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  // Check if we are in the browser
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('quizify_token');

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(cloned).pipe(
        catchError((err) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            // Auto-logout on invalid/expired token and redirect to login with context
            auth.logout();
            const reason = (err.error && (err.error.error || err.error.message)) || 'unauthorized';
            router.navigate(['/login'], { queryParams: { reason } });
          }
          return throwError(() => err);
        })
      );
    }
  }
  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        auth.logout();
        const reason = (err.error && (err.error.error || err.error.message)) || 'unauthorized';
        router.navigate(['/login'], { queryParams: { reason } });
      }
      return throwError(() => err);
    })
  );
};
