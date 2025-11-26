
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Questions } from './pages/questions/questions';
import { AddQuestion } from './pages/add-question/add-question';
import { Flashcards } from './pages/flashcards/flashcards';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';
import { Quiz } from './pages/quiz/quiz';
import { Admin } from './pages/admin/admin';
import { SystemStats } from './pages/system-stats/system-stats';

/**
 * Application Routes Configuration
 * 
 * Defines all routes with their components and route guards
 * Routes protected by AuthGuard require user to be logged in
 * Routes protected by AdminGuard require user to be logged in AND have admin role
 * 
 * Route categories:
 * - Public: login, register (no authentication required)
 * - Protected: profile, questions, flashcards, quiz (requires AuthGuard)
 * - Admin: admin, systemstats (requires AdminGuard)
 * - Default: flashcards (redirects to login if not authenticated)
 */
export const routes: Routes = [
  // Public authentication routes
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  // Protected user routes - require authentication
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'questions', component: Questions, canActivate: [AuthGuard] },
  { path: 'questions/add', component: AddQuestion, canActivate: [AuthGuard] },
  { path: 'questions/edit/:id', component: AddQuestion, canActivate: [AuthGuard] },
  { path: 'flashcards', component: Flashcards, canActivate: [AuthGuard] },
  { path: 'quiz', component: Quiz, canActivate: [AuthGuard] },
  
  // Admin-only routes - require authentication AND admin role
  { path: 'admin', component: Admin, canActivate: [AdminGuard] },
  { path: 'systemstats', component: SystemStats, canActivate: [AdminGuard]},
  
  // Default and fallback routes
  { path: '', component: Flashcards, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: 'login' }
];
