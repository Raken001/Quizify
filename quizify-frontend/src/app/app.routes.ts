
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Questions } from './pages/questions/questions';
import { AddQuestion } from './pages/add-question/add-question';
import { Flashcards } from './pages/flashcards/flashcards';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './services/auth.guard';
import { Quiz } from './pages/quiz/quiz';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'questions', component: Questions, canActivate: [AuthGuard] },
  { path: 'questions/add', component: AddQuestion, canActivate: [AuthGuard] },
  { path: 'questions/edit/:id', component: AddQuestion, canActivate: [AuthGuard] },
  { path: 'flashcards', component: Flashcards, canActivate: [AuthGuard] },
  { path: 'quiz', component: Quiz, canActivate: [AuthGuard] },
  { path: 'admin', component: Admin, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
