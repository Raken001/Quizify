import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Questions } from './pages/questions/questions';
import { AddQuestion } from './pages/add-question/add-question';
import { Flashcards } from './pages/flashcards/flashcards';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'questions', component: Questions }, 
  { path: 'questions/add', component: AddQuestion },
  { path: 'flashcards', component: Flashcards},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }          
];
