import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Quiz } from './quiz';
import { QuizService } from '../../services/quiz.service';
import { of, throwError } from 'rxjs';

describe('Quiz Component', () => {
  let component: Quiz;
  let fixture: ComponentFixture<Quiz>;
  let mockQuizService: jasmine.SpyObj<QuizService>;

  const mockQuestion = {
    _id: 'q1',
    question: 'What is 2+2?',
    options: ['3', '4', '5', '6']
  };

  const mockQuizSession = {
    sessionId: 'session123',
    totalQuestions: 5,
    firstQuestion: mockQuestion
  };

  beforeEach(async () => {
    mockQuizService = jasmine.createSpyObj('QuizService', [
      'getSubjects',
      'start',
      'submitAnswer',
      'getSession',
      'completeQuiz',
      'getResults'
    ]);

    await TestBed.configureTestingModule({
      imports: [Quiz, ReactiveFormsModule, FormsModule],
      providers: [{ provide: QuizService, useValue: mockQuizService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Quiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.quizStarted).toBe(false);
      expect(component.subjects).toEqual([]);
      expect(component.selectedSubject).toBe('');
      expect(component.sessionId).toBeNull();
      expect(component.currentQuestion).toBeNull();
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
      expect(component.quizComplete).toBe(false);
    });

    it('should have a form group with answer field', () => {
      expect(component.form.get('answer')).toBeTruthy();
    });

    it('should load subjects on ngOnInit', () => {
      mockQuizService.getSubjects.and.returnValue(of(['Math', 'Science', 'History']));
      
      component.ngOnInit();
      
      expect(mockQuizService.getSubjects).toHaveBeenCalled();
      expect(component.subjects).toEqual(['Math', 'Science', 'History']);
    });

    it('should handle empty subjects response', () => {
      mockQuizService.getSubjects.and.returnValue(of([] as any));
      
      component.ngOnInit();
      
      expect(component.subjects).toEqual([]);
    });

    it('should gracefully handle subject loading error', () => {
      mockQuizService.getSubjects.and.returnValue(throwError(() => new Error('Failed')));
      
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('Starting Quiz', () => {
    beforeEach(() => {
      component.subjects = ['Math', 'Science'];
    });

    it('should require subject selection', () => {
      component.selectedSubject = '';
      component.start();
      
      expect(component.error).toBe('Please select a subject first');
      expect(mockQuizService.start).not.toHaveBeenCalled();
    });

    it('should start quiz with selected subject', () => {
      component.selectedSubject = 'Math';
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      expect(mockQuizService.start).toHaveBeenCalledWith({
        count: 10,
        randomOrder: true,
        subject: 'Math'
      });
    });

    it('should start quiz without subject filter if "all" selected', () => {
      component.selectedSubject = 'all';
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      expect(mockQuizService.start).toHaveBeenCalledWith({
        count: 10,
        randomOrder: true
      });
    });

    it('should initialize quiz state on successful start', (done) => {
      component.selectedSubject = 'Math';
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      setTimeout(() => {
        expect(component.sessionId).toBe('session123');
        expect(component.totalQuestions).toBe(5);
        expect(component.currentQuestion).toEqual(mockQuestion);
        expect(component.quizStarted).toBe(true);
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should clear error on successful start', (done) => {
      component.error = 'Previous error';
      component.selectedSubject = 'Math';
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      setTimeout(() => {
        expect(component.error).toBe('');
        done();
      }, 0);
    });

    it('should set loading to true during start', () => {
      component.selectedSubject = 'Math';
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      expect(component.loading).toBe(true);
    });

    it('should handle quiz start error', (done) => {
      component.selectedSubject = 'Math';
      const error = { error: { error: 'No questions available' } };
      mockQuizService.start.and.returnValue(throwError(() => error));
      
      component.start();
      
      setTimeout(() => {
        expect(component.error).toBe('No questions available');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should use default error message when backend error missing', (done) => {
      component.selectedSubject = 'Math';
      mockQuizService.start.and.returnValue(throwError(() => new Error('Network error')));
      
      component.start();
      
      setTimeout(() => {
        expect(component.error).toContain('Failed to start quiz');
        done();
      }, 0);
    });

    it('should reset form when starting quiz', (done) => {
      component.selectedSubject = 'Math';
      component.form.patchValue({ answer: 'old value' });
      mockQuizService.start.and.returnValue(of(mockQuizSession));
      
      component.start();
      
      setTimeout(() => {
        expect(component.form.value.answer).toBeNull();
        done();
      }, 0);
    });
  });

  describe('Submitting Answers', () => {
    beforeEach(() => {
      component.sessionId = 'session123';
      component.currentQuestion = mockQuestion;
    });

    it('should not submit without session or question', () => {
      component.sessionId = null;
      component.selectedOption = '4';
      
      component.submit();
      
      expect(mockQuizService.submitAnswer).not.toHaveBeenCalled();
    });

    it('should not submit without answer', () => {
      component.selectedOption = null;
      component.form.patchValue({ answer: '' });
      
      component.submit();
      
      expect(mockQuizService.submitAnswer).not.toHaveBeenCalled();
    });

    it('should submit multiple choice answer when option selected', () => {
      component.selectedOption = '4';
      component.randomizedOptions = ['3', '4', '5', '6'];
      mockQuizService.submitAnswer.and.returnValue(of({ isComplete: false }));
      mockQuizService.getSession.and.returnValue(of({
        answers: [],
        flashcardIds: [{ _id: 'q2' }]
      }));
      
      component.submit();
      
      expect(mockQuizService.submitAnswer).toHaveBeenCalledWith('session123', 'q1', '4');
    });

    it('should submit text answer when no options available', () => {
      component.selectedOption = null;
      component.randomizedOptions = [];
      component.form.patchValue({ answer: 'text answer' });
      mockQuizService.submitAnswer.and.returnValue(of({ isComplete: false }));
      mockQuizService.getSession.and.returnValue(of({
        answers: [],
        flashcardIds: [{ _id: 'q2' }]
      }));
      
      component.submit();
      
      expect(mockQuizService.submitAnswer).toHaveBeenCalledWith('session123', 'q1', 'text answer');
    });

    it('should increment question index on successful submission', (done) => {
      const initialIndex = component.currentQuestionIndex;
      component.selectedOption = '4';
      mockQuizService.submitAnswer.and.returnValue(of({ isComplete: false }));
      mockQuizService.getSession.and.returnValue(of({
        answers: [],
        flashcardIds: [{ _id: 'q2' }]
      }));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.currentQuestionIndex).toBe(initialIndex + 1);
        done();
      }, 0);
    });

    it('should complete quiz when isComplete flag is true', (done) => {
      component.selectedOption = '4';
      mockQuizService.submitAnswer.and.returnValue(of({ isComplete: true }));
      mockQuizService.completeQuiz.and.returnValue(of({ score: 80 }));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.quizComplete).toBe(true);
        expect(component.currentQuestion).toBeNull();
        expect(mockQuizService.completeQuiz).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle submission error', (done) => {
      component.selectedOption = '4';
      const error = { error: { error: 'Answer validation failed' } };
      mockQuizService.submitAnswer.and.returnValue(throwError(() => error));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.error).toBe('Answer validation failed');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });
  });

  describe('Quiz Completion', () => {
    beforeEach(() => {
      component.sessionId = 'session123';
    });

    it('should retrieve quiz results', (done) => {
      const mockResults = { score: 80, correctAnswers: 8 };
      mockQuizService.getResults.and.returnValue(of(mockResults));
      
      component.viewResults();
      
      setTimeout(() => {
        expect(mockQuizService.getResults).toHaveBeenCalledWith('session123');
        expect(component.result).toEqual(mockResults);
        done();
      }, 0);
    });

    it('should set loading during result retrieval', () => {
      mockQuizService.getResults.and.returnValue(of({ score: 80 }));
      
      component.viewResults();
      
      expect(component.loading).toBe(true);
    });

    it('should handle results retrieval error', (done) => {
      const error = { error: { error: 'Results not found' } };
      mockQuizService.getResults.and.returnValue(throwError(() => error));
      
      component.viewResults();
      
      setTimeout(() => {
        expect(component.error).toBe('Results not found');
        done();
      }, 0);
    });
  });

  describe('Restarting Quiz', () => {
    beforeEach(() => {
      component.sessionId = 'session123';
      component.currentQuestion = mockQuestion;
      component.quizStarted = true;
      component.quizComplete = true;
      component.selectedSubject = 'Math';
      component.currentQuestionIndex = 5;
      component.result = { score: 80 };
    });

    it('should reset all quiz state', () => {
      component.restartQuiz();
      
      expect(component.sessionId).toBeNull();
      expect(component.currentQuestion).toBeNull();
      expect(component.quizStarted).toBe(false);
      expect(component.quizComplete).toBe(false);
      expect(component.selectedSubject).toBe('');
      expect(component.currentQuestionIndex).toBe(0);
      expect(component.result).toBeNull();
      expect(component.error).toBe('');
      expect(component.randomizedOptions).toEqual([]);
    });
  });

  describe('Option Randomization', () => {
    it('should randomize options array', () => {
      const options = ['A', 'B', 'C', 'D'];
      const randomized = component['randomizeOptions'](options);
      
      expect(randomized.length).toBe(4);
      expect(randomized).toContain('A');
      expect(randomized).toContain('B');
      expect(randomized).toContain('C');
      expect(randomized).toContain('D');
    });

    it('should return empty array for null options', () => {
      const randomized = component['randomizeOptions'](null as any);
      expect(randomized).toEqual([]);
    });

    it('should convert non-string options to strings', () => {
      const options = [1, 2, 3, 4];
      const randomized = component['randomizeOptions'](options);
      
      expect(randomized.every(opt => typeof opt === 'string')).toBe(true);
    });

    it('should return consistent set of options', () => {
      const options = ['A', 'B', 'C', 'D'];
      const randomized = component['randomizeOptions'](options);
      const randomized2 = component['randomizeOptions'](options);
      
      expect(randomized.sort()).toEqual(randomized2.sort());
    });

    it('should get randomized options from component', () => {
      component.randomizedOptions = ['4', '3', '5', '6'];
      const options = component.getOptions();
      
      expect(options).toEqual(['4', '3', '5', '6']);
    });
  });

  describe('Next Question Retrieval', () => {
    beforeEach(() => {
      component.sessionId = 'session123';
      component.currentQuestion = mockQuestion;
    });

    it('should not proceed without session id', () => {
      component.sessionId = null;
      
      component['getNextQuestion']();
      
      expect(mockQuizService.getSession).not.toHaveBeenCalled();
    });

    it('should fetch next unanswered question', (done) => {
      const nextQuestion = {
        _id: 'q2',
        question: 'What is 3+3?',
        options: ['5', '6', '7', '8']
      };
      
      mockQuizService.getSession.and.returnValue(of({
        answers: [{ questionId: 'q1' }],
        flashcardIds: [mockQuestion, nextQuestion]
      }));
      
      component['getNextQuestion']();
      
      setTimeout(() => {
        expect(component.currentQuestion).toEqual(nextQuestion);
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should complete quiz when no more questions', (done) => {
      mockQuizService.getSession.and.returnValue(of({
        answers: [{ questionId: 'q1' }],
        flashcardIds: [mockQuestion]
      }));
      mockQuizService.completeQuiz.and.returnValue(of({ score: 100 }));
      
      component['getNextQuestion']();
      
      setTimeout(() => {
        expect(component.quizComplete).toBe(true);
        expect(mockQuizService.completeQuiz).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle session retrieval error', (done) => {
      const error = { error: { error: 'Session not found' } };
      mockQuizService.getSession.and.returnValue(throwError(() => error));
      
      component['getNextQuestion']();
      
      setTimeout(() => {
        expect(component.error).toBe('Session not found');
        done();
      }, 0);
    });
  });
});
