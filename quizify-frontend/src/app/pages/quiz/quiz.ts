import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
})
export class Quiz implements OnInit {
  quizStarted = false;
  subjects: string[] = [];
  selectedSubject: string = '';
  
  sessionId: string | null = null;
  currentQuestion: any = null;
  currentQuestionIndex = 0;
  totalQuestions = 0;
  result: any = null;
  error = '';
  loading = false;
  form: FormGroup;
  quizComplete = false;
  selectedOption: string | null = null;

  constructor(private quizService: QuizService, private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      answer: ['']
    });
  }

  ngOnInit() {
    // Load subjects for selection
    this.http.get<string[]>('http://localhost:8000/flashcards/subjects').subscribe({
      next: (subs) => this.subjects = subs || [],
      error: () => {/* non-blocking */}
    });
  }

  start() {
    if (!this.selectedSubject) {
      this.error = 'Please select a subject first';
      return;
    }
    this.loading = true;
    this.error = '';
    this.quizComplete = false;
    const options: any = { count: 10, randomOrder: true };
    if (this.selectedSubject && this.selectedSubject !== 'all') {
      options.subject = this.selectedSubject;
    }
    this.quizService.start(options).subscribe({
      next: (data: any) => {
        this.sessionId = data.sessionId;
        this.totalQuestions = data.totalQuestions;
        this.currentQuestion = data.firstQuestion;
        this.currentQuestionIndex = 0;
        this.loading = false;
        this.form.reset();
        this.selectedOption = null;
        this.quizStarted = true;
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to start quiz. Make sure you have added some questions first.';
        this.loading = false;
      }
    });
  }

  submit() {
    if (!this.sessionId || !this.currentQuestion) return;
    // Prefer multiple-choice selection when options are present
    const isMCQ = this.getOptions().length > 0;
    const answer = isMCQ ? this.selectedOption : this.form.value.answer;
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
          this.selectedOption = null;
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
    this.quizStarted = false;
    this.selectedSubject = '';
  }

  getOptions(): string[] {
    if (!this.currentQuestion) return [];
    const opts = Array.isArray(this.currentQuestion.options)
      ? this.currentQuestion.options
      : (Array.isArray(this.currentQuestion.tags) ? this.currentQuestion.tags : []);
    // Ensure string array
    return (opts || []).map((o: any) => String(o));
  }
}
