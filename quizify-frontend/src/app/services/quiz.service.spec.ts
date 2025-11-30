import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizService]
    });

    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('start', () => {
    it('should start a new quiz session', () => {
      const mockQuizOptions = {
        subject: 'Mathematics',
        difficulty: 'medium',
        questionCount: 10
      };

      const mockResponse = {
        sessionId: '123abc',
        questions: []
      };

      service.start(mockQuizOptions).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/quiz/start');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuizOptions);
      req.flush(mockResponse);
    });

    it('should start quiz with empty options', () => {
      const mockResponse = {
        sessionId: '123abc',
        questions: []
      };

      service.start().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/quiz/start');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('getSession', () => {
    it('should retrieve quiz session data', () => {
      const sessionId = '123abc';
      const mockSession = {
        sessionId,
        currentQuestion: 1,
        totalQuestions: 10
      };

      service.getSession(sessionId).subscribe(response => {
        expect(response).toEqual(mockSession);
      });

      const req = httpMock.expectOne(`http://localhost:8000/quiz/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer to a question', () => {
      const sessionId = '123abc';
      const questionId = 'q123';
      const answer = 'option_a';

      const mockResponse = {
        success: true,
        currentQuestion: 2
      };

      service.submitAnswer(sessionId, questionId, answer).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8000/quiz/${sessionId}/answer`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        questionId,
        userAnswer: answer
      });
      req.flush(mockResponse);
    });
  });

  describe('completeQuiz', () => {
    it('should complete the quiz', () => {
      const sessionId = '123abc';
      const mockResponse = {
        resultId: 'result456',
        score: 85,
        totalQuestions: 10
      };

      service.completeQuiz(sessionId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8000/quiz/${sessionId}/complete`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getResults', () => {
    it('should retrieve quiz results', () => {
      const resultId = 'result456';
      const mockResults = {
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8,
        timestamp: new Date()
      };

      service.getResults(resultId).subscribe(response => {
        expect(response).toEqual(mockResults);
      });

      const req = httpMock.expectOne(`http://localhost:8000/quiz/results/${resultId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResults);
    });
  });
});
