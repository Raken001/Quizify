import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Questions } from './questions';
import { FlashcardService } from '../../services/flashcard.service';
import { of, throwError } from 'rxjs';

describe('Questions Component', () => {
  let component: Questions;
  let fixture: ComponentFixture<Questions>;
  let mockFlashcardService: jasmine.SpyObj<FlashcardService>;

  const mockQuestions = [
    {
      _id: 'q1',
      subject: 'Math',
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy',
      options: ['3', '4', '5', '6']
    },
    {
      _id: 'q2',
      subject: 'Science',
      question: 'What is H2O?',
      answer: 'Water',
      difficulty_level: 1,
      options: ['Water', 'Hydrogen', 'Oxygen', 'Salt']
    },
    {
      _id: 'q3',
      subject: 'History',
      question: 'Who discovered gravity?',
      answer: 'Newton',
      difficulty_level: 2
    }
  ];

  beforeEach(async () => {
    mockFlashcardService = jasmine.createSpyObj('FlashcardService', [
      'getAll',
      'delete'
    ]);

    await TestBed.configureTestingModule({
      imports: [Questions, RouterModule],
      providers: [
        { provide: FlashcardService, useValue: mockFlashcardService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Questions);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(true);
      expect(component.error).toBeNull();
      expect(component.data).toEqual([]);
    });

    it('should call refresh on ngOnInit', () => {
      spyOn(component, 'refresh');
      mockFlashcardService.getAll.and.returnValue(of([]));
      
      component.ngOnInit();
      
      expect(component.refresh).toHaveBeenCalled();
    });
  });

  describe('Refreshing Questions', () => {
    it('should load all questions', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      setTimeout(() => {
        expect(mockFlashcardService.getAll).toHaveBeenCalled();
        expect(component.data).toEqual(mockQuestions);
        done();
      }, 0);
    });

    it('should set loading to true on initial load', () => {
      component.data = [];
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      expect(component.loading).toBe(true);
    });

    it('should set loading to false after load', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should not show loading state on subsequent loads', () => {
      component.data = mockQuestions;
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      expect(component.loading).toBe(false);
    });

    it('should clear error on successful load', (done) => {
      component.error = 'Previous error';
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 0);
    });

    it('should handle load error', (done) => {
      const error = { error: { error: 'Failed to load questions' } };
      mockFlashcardService.getAll.and.returnValue(throwError(() => error));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to load questions');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should use default error message', (done) => {
      mockFlashcardService.getAll.and.returnValue(throwError(() => new Error('Network error')));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to load questions');
        done();
      }, 0);
    });

    it('should handle empty questions list', (done) => {
      mockFlashcardService.getAll.and.returnValue(of([]));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.data).toEqual([]);
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });
  });

  describe('Difficulty Labeling', () => {
    it('should return difficulty value if present', () => {
      const row = { difficulty: 'hard' };
      const label = component.difficultyLabel(row);
      expect(label).toBe('hard');
    });

    it('should convert difficulty_level 1 to easy', () => {
      const row = { difficulty_level: 1 };
      const label = component.difficultyLabel(row);
      expect(label).toBe('easy');
    });

    it('should convert difficulty_level 2 to medium', () => {
      const row = { difficulty_level: 2 };
      const label = component.difficultyLabel(row);
      expect(label).toBe('medium');
    });

    it('should convert difficulty_level 3 to hard', () => {
      const row = { difficulty_level: 3 };
      const label = component.difficultyLabel(row);
      expect(label).toBe('hard');
    });

    it('should return dash for unknown difficulty level', () => {
      const row = { difficulty_level: 99 };
      const label = component.difficultyLabel(row);
      expect(label).toBe('-');
    });

    it('should return dash for missing difficulty', () => {
      const row = {};
      const label = component.difficultyLabel(row);
      expect(label).toBe('-');
    });

    it('should handle null row', () => {
      const label = component.difficultyLabel(null);
      expect(label).toBe('-');
    });

    it('should prefer difficulty over difficulty_level', () => {
      const row = { difficulty: 'easy', difficulty_level: 3 };
      const label = component.difficultyLabel(row);
      expect(label).toBe('easy');
    });

    it('should convert string difficulty_level to number', () => {
      const row = { difficulty_level: '2' };
      const label = component.difficultyLabel(row);
      expect(label).toBe('medium');
    });
  });

  describe('Deleting Questions', () => {
    beforeEach(() => {
      component.data = [...mockQuestions];
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should show confirmation dialog before deletion', () => {
      mockFlashcardService.delete.and.returnValue(of({}));
      
      component.delete('q1');
      
      expect(window.confirm).toHaveBeenCalledWith('Delete this flashcard?');
    });

    it('should not delete if user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.delete('q1');
      
      expect(mockFlashcardService.delete).not.toHaveBeenCalled();
    });

    it('should not delete if no ID provided', () => {
      component.delete('');
      
      expect(mockFlashcardService.delete).not.toHaveBeenCalled();
    });

    it('should call delete service with correct ID', () => {
      mockFlashcardService.delete.and.returnValue(of({}));
      
      component.delete('q1');
      
      expect(mockFlashcardService.delete).toHaveBeenCalledWith('q1');
    });

    it('should update UI instantly after deletion using _id', () => {
      mockFlashcardService.delete.and.returnValue(of({}));
      
      component.delete('q1');
      
      expect(component.data.length).toBe(2);
      expect(component.data.find(x => (x._id || x.id) === 'q1')).toBeUndefined();
    });

    it('should update UI instantly after deletion using id field', () => {
      const dataWithIdField = [
        { id: 'q1', subject: 'Math', question: 'Q1' },
        { id: 'q2', subject: 'Science', question: 'Q2' }
      ];
      component.data = dataWithIdField;
      mockFlashcardService.delete.and.returnValue(of({}));
      
      component.delete('q1');
      
      expect(component.data.length).toBe(1);
      expect(component.data.find(x => (x._id || x.id) === 'q1')).toBeUndefined();
    });

    it('should handle deletion error', () => {
      const error = { error: { error: 'Cannot delete question' } };
      mockFlashcardService.delete.and.returnValue(throwError(() => error));
      
      component.delete('q1');
      
      expect(component.error).toBe('Cannot delete question');
    });

    it('should use default error message on deletion error', () => {
      mockFlashcardService.delete.and.returnValue(throwError(() => new Error('Network error')));
      
      component.delete('q1');
      
      expect(component.error).toBe('Delete failed');
    });

    it('should preserve other items after deletion', () => {
      mockFlashcardService.delete.and.returnValue(of({}));
      const initialLength = component.data.length;
      
      component.delete('q1');
      
      expect(component.data.length).toBe(initialLength - 1);
      expect(component.data).toContain(mockQuestions[1]);
      expect(component.data).toContain(mockQuestions[2]);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve question data during load', (done) => {
      mockFlashcardService.getAll.and.returnValue(of(mockQuestions));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.data[0]._id).toBe('q1');
        expect(component.data[0].subject).toBe('Math');
        expect(component.data[0].question).toBe('What is 2+2?');
        expect(component.data[0].answer).toBe('4');
        done();
      }, 0);
    });

    it('should handle questions with mixed id field names', (done) => {
      const mixedData = [
        { _id: 'q1', subject: 'Math', question: 'Q1' },
        { id: 'q2', subject: 'Science', question: 'Q2' }
      ];
      mockFlashcardService.getAll.and.returnValue(of(mixedData));
      
      component.refresh();
      
      setTimeout(() => {
        expect(component.data.length).toBe(2);
        expect(component.data[0]._id).toBe('q1');
        expect(component.data[1].id).toBe('q2');
        done();
      }, 0);
    });
  });
});
