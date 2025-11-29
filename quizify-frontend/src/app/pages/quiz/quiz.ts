import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';

/**
 * Quiz Component
 * Manages the quiz taking experience
 * Handles quiz initialization, question navigation, answer submission, and results display
 */
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
  randomizedOptions: string[] = [];

  constructor(private quizService: QuizService, private fb: FormBuilder) {
    this.form = this.fb.group({
      answer: ['']
    });
  }

  /**
   * Initialize component - load available subjects
   */
  ngOnInit(): void {
    this.loadSubjects();
  }

  /**
   * Loads all available subjects for quiz filtering
   * Non-blocking operation - errors are ignored
   */
  private loadSubjects(): void {
    this.quizService.getSubjects().subscribe({
      next: (subs: any) => this.subjects = subs || [],
      error: () => {/* non-blocking */}
    });
  }

  /**
   * Starts a new quiz session with selected subject
   * Initializes the first question and prepares quiz interface
   */
  start(): void {
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
        this.randomizedOptions = this.randomizeOptions(this.currentQuestion.options);
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

  /**
   * Submits the current question's answer
   * Handles both multiple choice and text answers
   * Moves to next question or completes quiz if no more questions
   */
  submit(): void {
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

  /**
   * Retrieves the next unanswered question from the current session
   * Resets form and selected option for new question
   * Completes quiz if no more questions available
   */
  private getNextQuestion(): void {
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
          this.randomizedOptions = this.randomizeOptions(nextQuestion.options);
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

  /**
   * Completes the current quiz session and retrieves final results
   * Called when all questions have been answered
   */
  private completeQuiz(): void {
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

  /**
   * Retrieves detailed results for the completed quiz
   * Called when user clicks to view detailed results
   */
  viewResults(): void {
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

  /**
   * Resets quiz state to initial state for starting a new quiz
   */
  restartQuiz(): void {
    this.sessionId = null;
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 0;
    this.result = null;
    this.error = '';
    this.quizComplete = false;
    this.quizStarted = false;
    this.selectedSubject = '';
    this.randomizedOptions = [];
  }

  /**
   * Extracts options from current question
   * Returns the pre-randomized options to maintain consistency
   * @returns Array of option strings
   */
  getOptions(): string[] {
    return this.randomizedOptions;
  }

  /**
   * Randomizes the order of options
   * Creates a new array with shuffled options to maintain consistency
   * @param options Original options array
   * @returns Randomized copy of options array
   */
  private randomizeOptions(options: any[]): string[] {
    if (!Array.isArray(options)) return [];
    const stringOptions = options.map((o: any) => String(o));
    // Create a copy and shuffle
    return [...stringOptions].sort(() => Math.random() - 0.5);
  }
}
