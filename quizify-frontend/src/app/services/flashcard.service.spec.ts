import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FlashcardService } from './flashcard.service';

describe('FlashcardService', () => {
  let service: FlashcardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlashcardService]
    });

    service = TestBed.inject(FlashcardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should fetch all flashcards', () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1', subject: 'Math' },
        { id: '2', question: 'Q2', answer: 'A2', subject: 'Science' }
      ];

      service.getAll().subscribe(flashcards => {
        expect(flashcards).toEqual(mockFlashcards);
        expect((flashcards as any[]).length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlashcards);
    });

    it('should return empty array if no flashcards', () => {
      service.getAll().subscribe(flashcards => {
        expect(flashcards).toEqual([]);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards');
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should fetch flashcard by ID', () => {
      const mockFlashcard = { id: '1', question: 'Q1', answer: 'A1', subject: 'Math' };

      service.getById('1').subscribe(flashcard => {
        expect(flashcard).toEqual(mockFlashcard);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlashcard);
    });

    it('should handle 404 error', () => {
      service.getById('nonexistent').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/flashcards/nonexistent');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('add', () => {
    it('should create new flashcard', () => {
      const newFlashcard = { question: 'Q3', answer: 'A3', subject: 'History' };
      const mockResponse = { id: '3', ...newFlashcard };

      service.add(newFlashcard).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newFlashcard);
      req.flush(mockResponse);
    });

    it('should return 400 for invalid flashcard', () => {
      const invalidFlashcard = { question: 'Q' };

      service.add(invalidFlashcard).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/flashcards');
      req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update existing flashcard', () => {
      const updated = { question: 'Updated Q1', answer: 'Updated A1' };
      const mockResponse = { id: '1', ...updated, subject: 'Math' };

      service.update('1', updated).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete flashcard', () => {
      service.delete('1').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getSubjects', () => {
    it('should fetch all subjects', () => {
      const mockSubjects = ['Math', 'Science', 'History', 'Literature'];

      service.getSubjects().subscribe(subjects => {
        expect(subjects).toEqual(mockSubjects);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards/subjects');
      expect(req.request.method).toBe('GET');
      req.flush(mockSubjects);
    });
  });

  describe('getBySubject', () => {
    it('should fetch flashcards by subject', () => {
      const mockFlashcards = [
        { id: '1', question: 'Math Q1', answer: 'A1', subject: 'Math' }
      ];

      service.getBySubject('Math').subscribe((flashcards: any) => {
        expect(flashcards).toEqual(mockFlashcards);
      });

      const req = httpMock.expectOne('http://localhost:8000/flashcards?subject=Math');
      expect(req.request.method).toBe('GET');
      req.flush(mockFlashcards);
    });
  });
});
