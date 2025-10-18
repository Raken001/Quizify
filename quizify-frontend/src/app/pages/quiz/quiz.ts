import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
})
export class Quiz implements OnInit {
  sessionId: string | null = null;
  currentQuestion: any = null;
  currentQuestionIndex = 0;
  totalQuestions = 0;
  result: any = null;
  error = '';
  loading = false;
  form: FormGroup;
  quizComplete = false;

  constructor(private quizService: QuizService, private fb: FormBuilder) {
    this.form = this.fb.group({
      answer: ['']
    });
  }

  ngOnInit() {
    this.start();
  }

  start() {
    this.loading = true;
    this.error = '';
    this.quizComplete = false;
    this.quizService.start({ count: 10, randomOrder: true }).subscribe({
      next: (data: any) => {
        this.sessionId = data.sessionId;
        this.totalQuestions = data.totalQuestions;
        this.currentQuestion = data.firstQuestion;
        this.currentQuestionIndex = 0;
        this.loading = false;
        this.form.reset();
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to start quiz. Make sure you have added some questions first.';
        this.loading = false;
      }
    });
  }

  submit() {
    if (!this.sessionId || !this.currentQuestion) return;
    const answer = this.form.value.answer;
    if (!answer) return;

    this.loading = true;
    this.quizService.submitAnswer(this.sessionId, this.currentQuestion._id, answer).subscribe({
      next: (data: any) => {
        this.result = data;
        this.currentQuestionIndex++;
        
        if (data.isComplete) {
          // Quiz complete - mark as complete and get results
          this.quizComplete = true;
          this.currentQuestion = null;
          this.completeQuiz();
        } else {
          // Get next question from session
          this.getNextQuestion();
        }
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to submit answer';
        this.loading = false;
      }
    });
  }

  getNextQuestion() {
    if (!this.sessionId) return;
    this.quizService.getSession(this.sessionId).subscribe({
      next: (session: any) => {
        // Get the next unanswered question
        const answeredQuestionIds = session.answers.map((a: any) => a.questionId.toString());
        const nextQuestion = session.flashcardIds.find((fc: any) => 
          !answeredQuestionIds.includes(fc._id.toString())
        );
        
        if (nextQuestion) {
          this.currentQuestion = nextQuestion;
          this.form.reset();
          this.loading = false;
        } else {
          // No more questions - complete quiz
          this.quizComplete = true;
          this.currentQuestion = null;
          this.completeQuiz();
        }
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to get next question';
        this.loading = false;
      }
    });
  }

  completeQuiz() {
    if (!this.sessionId) return;
    this.quizService.completeQuiz(this.sessionId).subscribe({
      next: (results: any) => {
        this.result = results;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Failed to complete quiz';
        this.loading = false;
      }
    });
  }

  viewResults() {
    if (!this.sessionId) return;
    this.loading = true;
    this.quizService.getResults(this.sessionId).subscribe({
      next: (data: any) => {
        this.result = data;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to get results';
        this.loading = false;
      }
    });
  }

  restartQuiz() {
    this.sessionId = null;
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 0;
    this.result = null;
    this.error = '';
    this.quizComplete = false;
    this.start();
  }
}
