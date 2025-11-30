import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Flashcards } from './flashcards';
import { FlashcardService } from '../../services/flashcard.service';
import { of, throwError } from 'rxjs';

describe('Flashcards Component', () => {
  let component: Flashcards;
  let fixture: ComponentFixture<Flashcards>;
  let mockFlashcardService: jasmine.SpyObj<FlashcardService>;

  const mockCards = [
    {
      _id: 'card1',
      subject: 'Math',
      question: 'What is 2+2?',
      answer: '4',
      options: ['3', '4', '5', '6']
    },
    {
      _id: 'card2',
      subject: 'Science',
      question: 'What is H2O?',
      answer: 'Water',
      options: ['Water', 'Hydrogen', 'Oxygen', 'Salt']
    }
  ];

  beforeEach(async () => {
    mockFlashcardService = jasmine.createSpyObj('FlashcardService', [
      'getSubjects',
      'getAll',
      'getBySubject'
    ]);

    await TestBed.configureTestingModule({
      imports: [Flashcards, FormsModule, RouterModule],
      providers: [{ provide: FlashcardService, useValue: mockFlashcardService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Flashcards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(true);
      expect(component.error).toBeNull();
      expect(component.data).toEqual([]);
      expect(component.index).toBe(0);
      expect(component.showAnswer).toBe(false);
      expect(component.selectedSubject).toBe('');
      expect(component.isChangingCard).toBe(false);
    });

    it('should load subjects and cards on ngOnInit', () => {
      mockFlashcardService.getSubjects.and.returnValue(of(['Math', 'Science']));
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.ngOnInit();
      
      expect(mockFlashcardService.getSubjects).toHaveBeenCalled();
      expect(mockFlashcardService.getAll).toHaveBeenCalled();
    });

    it('should not throw on subject loading error', () => {
      mockFlashcardService.getSubjects.and.returnValue(throwError(() => new Error('Failed')));
      mockFlashcardService.getAll.and.returnValue(of([]));
      
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('Loading Cards', () => {
    it('should load all cards when no subject selected', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(mockFlashcardService.getAll).toHaveBeenCalled();
        expect(component.data.length).toBe(2);
        done();
      }, 0);
    });

    it('should load cards filtered by subject', (done) => {
      component.selectedSubject = 'Math';
      const mathCards = [mockCards[0]];
      mockFlashcardService.getBySubject.and.returnValue(of(mathCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(mockFlashcardService.getBySubject).toHaveBeenCalledWith('Math');
        expect(component.data.length).toBe(1);
        done();
      }, 0);
    });

    it('should transform card data correctly', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.data[0]._id).toBe('card1');
        expect(component.data[0].subject).toBe('Math');
        expect(component.data[0].question).toBe('What is 2+2?');
        expect(component.data[0].answer).toBe('4');
        expect(component.data[0].options).toEqual(['3', '4', '5', '6']);
        done();
      }, 0);
    });

    it('should handle cards with correct_answer field', (done) => {
      const cardsWithCorrectAnswer = [{
        _id: 'card1',
        subject: 'Math',
        question: 'What is 2+2?',
        correct_answer: '4',
        options: ['3', '4', '5', '6']
      }];
      mockFlashcardService.getAll.and.returnValue(of(cardsWithCorrectAnswer));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.data[0].answer).toBe('4');
        done();
      }, 0);
    });

    it('should set loading to true initially', () => {
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      expect(component.loading).toBe(true);
    });

    it('should set loading to false after load', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should reset index and hide answer on load', (done) => {
      component.index = 1;
      component.showAnswer = true;
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.index).toBe(0);
        expect(component.showAnswer).toBe(false);
        done();
      }, 0);
    });

    it('should clear error on successful load', (done) => {
      component.error = 'Previous error';
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 0);
    });

    it('should handle load error', (done) => {
      const error = { error: { error: 'Failed to fetch cards' } };
      mockFlashcardService.getAll.and.returnValue(throwError(() => error));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to fetch cards');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should use default error message', (done) => {
      mockFlashcardService.getAll.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to load flashcards');
        done();
      }, 0);
    });
  });

  describe('Card Flipping', () => {
    beforeEach(() => {
      component.data = mockCards;
      component.isChangingCard = false;
    });

    it('should toggle answer visibility', () => {
      component.flip();
      expect(component.showAnswer).toBe(true);
      
      component.flip();
      expect(component.showAnswer).toBe(false);
    });

    it('should not flip while changing card', () => {
      component.showAnswer = false;
      component.isChangingCard = true;
      
      component.flip();
      
      expect(component.showAnswer).toBe(false);
    });
  });

  describe('Card Navigation', () => {
    beforeEach(() => {
      component.data = mockCards;
      component.index = 0;
      component.showAnswer = true;
      component.isChangingCard = false;
    });

    it('should move to next card', (done) => {
      component.next();
      
      expect(component.index).toBe(1);
      setTimeout(() => {
        expect(component.showAnswer).toBe(false);
        done();
      }, 60);
    });

    it('should wrap to beginning after last card', (done) => {
      component.index = 1;
      
      component.next();
      
      expect(component.index).toBe(0);
      setTimeout(() => {
        expect(component.showAnswer).toBe(false);
        done();
      }, 60);
    });

    it('should move to previous card', (done) => {
      component.index = 1;
      
      component.prev();
      
      expect(component.index).toBe(0);
      setTimeout(() => {
        expect(component.showAnswer).toBe(false);
        done();
      }, 60);
    });

    it('should wrap to end when going before first card', (done) => {
      component.index = 0;
      
      component.prev();
      
      expect(component.index).toBe(1);
      setTimeout(() => {
        expect(component.showAnswer).toBe(false);
        done();
      }, 60);
    });

    it('should reset answer visibility on card change', (done) => {
      component.showAnswer = true;
      
      component.next();
      
      setTimeout(() => {
        expect(component.showAnswer).toBe(false);
        done();
      }, 60);
    });

    it('should disable transitions during card change', () => {
      component.isChangingCard = false;
      
      component.next();
      
      expect(component.isChangingCard).toBe(true);
    });

    it('should re-enable transitions after card change', (done) => {
      component.next();
      
      setTimeout(() => {
        expect(component.isChangingCard).toBe(false);
        done();
      }, 60);
    });
  });

  describe('Subject Filtering', () => {
    it('should load filtered cards when subject changes', (done) => {
      const scienceCards = [mockCards[1]];
      mockFlashcardService.getBySubject.and.returnValue(of(scienceCards));
      
      component.selectedSubject = 'Science';
      component.loadCards();
      
      setTimeout(() => {
        expect(component.data.length).toBe(1);
        expect(component.data[0].subject).toBe('Science');
        done();
      }, 0);
    });

    it('should load all cards when subject cleared', (done) => {
      component.selectedSubject = '';
      mockFlashcardService.getAll.and.returnValue(of(mockCards));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(mockFlashcardService.getAll).toHaveBeenCalled();
        expect(component.data.length).toBe(2);
        done();
      }, 0);
    });
  });

  describe('Card Data Handling', () => {
    it('should handle empty options array', (done) => {
      const cardsWithoutOptions = [{
        _id: 'card1',
        subject: 'Math',
        question: 'What is 2+2?',
        answer: '4'
      }];
      mockFlashcardService.getAll.and.returnValue(of(cardsWithoutOptions));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.data[0].options).toEqual([]);
        done();
      }, 0);
    });

    it('should handle empty cards list', (done) => {
      mockFlashcardService.getAll.and.returnValue(of([]));
      
      component.loadCards();
      
      setTimeout(() => {
        expect(component.data).toEqual([]);
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });
  });
});
