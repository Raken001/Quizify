import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // First check if user is logged in
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Then check if user is admin by fetching profile
  return http.get<any>('http://localhost:8000/users/profile').pipe(
    map(data => {
      if (data.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
