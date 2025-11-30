import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddQuestion } from './add-question';
import { FlashcardService } from '../../services/flashcard.service';
import { of, throwError } from 'rxjs';

describe('AddQuestion Component', () => {
  let component: AddQuestion;
  let fixture: ComponentFixture<AddQuestion>;
  let mockFlashcardService: jasmine.SpyObj<FlashcardService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockFlashcard = {
    _id: 'card1',
    subject: 'Math',
    question: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    answer: '4',
    difficulty: 'easy'
  };

  beforeEach(async () => {
    mockFlashcardService = jasmine.createSpyObj('FlashcardService', [
      'add',
      'update',
      'getById'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AddQuestion, ReactiveFormsModule],
      providers: [
        { provide: FlashcardService, useValue: mockFlashcardService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddQuestion);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('subject')?.value).toBe('');
      expect(component.form.get('question')?.value).toBe('');
      expect(component.form.get('option1')?.value).toBe('');
      expect(component.form.get('option2')?.value).toBe('');
      expect(component.form.get('option3')?.value).toBe('');
      expect(component.form.get('option4')?.value).toBe('');
      expect(component.form.get('answer')?.value).toBe('');
      expect(component.form.get('difficulty')?.value).toBe('medium');
    });

    it('should initialize with default state', () => {
      expect(component.submitting).toBe(false);
      expect(component.error).toBeNull();
      expect(component.success).toBeNull();
      expect(component.isEdit).toBe(false);
      expect(component.editingId).toBeNull();
    });

    it('should detect create mode when no ID in route', () => {
      expect(component.isEdit).toBe(false);
      expect(component.editingId).toBeNull();
    });

    it('should detect edit mode when ID in route', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('card1');
      mockFlashcardService.getById.and.returnValue(of(mockFlashcard));
      
      component.ngOnInit();
      
      expect(component.isEdit).toBe(true);
      expect(component.editingId).toBe('card1');
    });
  });

  describe('Form Validation', () => {
    it('should require all mandatory fields', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should require subject field', () => {
      const control = component.form.get('subject');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require question field', () => {
      const control = component.form.get('question');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require all option fields', () => {
      ['option1', 'option2', 'option3', 'option4'].forEach(field => {
        const control = component.form.get(field);
        control?.setValue('');
        expect(control?.hasError('required')).toBe(true);
      });
    });

    it('should require answer field', () => {
      const control = component.form.get('answer');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require difficulty field', () => {
      const control = component.form.get('difficulty');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate complete form', () => {
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
      
      expect(component.form.valid).toBe(true);
    });

    it('should accept default difficulty value', () => {
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4'
      });
      
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Creating Questions', () => {
    beforeEach(() => {
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
    });

    it('should not submit invalid form', () => {
      component.form.patchValue({ subject: '' });
      
      component.submit();
      
      expect(mockFlashcardService.add).not.toHaveBeenCalled();
    });

    it('should mark form as touched on invalid submission', () => {
      component.form.patchValue({ subject: '' });
      
      component.submit();
      
      expect(component.form.touched).toBe(true);
    });

    it('should show error message for invalid form', () => {
      component.form.patchValue({ subject: '' });
      
      component.submit();
      
      expect(component.error).toBe('Please fill all fields.');
    });

    it('should call add service with correct payload', () => {
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      expect(mockFlashcardService.add).toHaveBeenCalledWith({
        subject: 'Math',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
        difficulty: 'easy'
      });
    });

    it('should set submitting state during submission', () => {
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      expect(component.submitting).toBe(true);
    });

    it('should show success message after creation', (done) => {
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.success).toBe('Question added!');
        done();
      }, 0);
    });

    it('should set submitting to false after submission', (done) => {
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.submitting).toBe(false);
        done();
      }, 0);
    });

    it('should navigate to questions page after creation', (done) => {
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/questions']);
        done();
      }, 450);
    });

    it('should clear error on successful submission', (done) => {
      component.error = 'Previous error';
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 0);
    });

    it('should handle submission error', (done) => {
      const error = { error: { error: 'Subject already exists' } };
      mockFlashcardService.add.and.returnValue(throwError(() => error));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.error).toBe('Subject already exists');
        expect(component.submitting).toBe(false);
        done();
      }, 0);
    });

    it('should use default error message on submission error', (done) => {
      mockFlashcardService.add.and.returnValue(throwError(() => new Error('Error')));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to add question');
        done();
      }, 0);
    });
  });

  describe('Editing Questions', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('card1');
      component.isEdit = true;
      component.editingId = 'card1';
    });

    it('should load flashcard data for editing', () => {
      mockFlashcardService.getById.and.returnValue(of(mockFlashcard));
      
      component['loadFlashcardForEdit']('card1');
      
      setTimeout(() => {
        expect(component.form.value.subject).toBe('Math');
        expect(component.form.value.question).toBe('What is 2+2?');
      }, 0);
    });

    it('should populate all fields from loaded flashcard', (done) => {
      mockFlashcardService.getById.and.returnValue(of(mockFlashcard));
      
      component['loadFlashcardForEdit']('card1');
      
      setTimeout(() => {
        expect(component.form.value).toEqual({
          subject: 'Math',
          question: 'What is 2+2?',
          option1: '3',
          option2: '4',
          option3: '5',
          option4: '6',
          answer: '4',
          difficulty: 'easy'
        });
        done();
      }, 0);
    });

    it('should call update service instead of add', () => {
      component.form.patchValue({
        subject: 'Math',
        question: 'Updated question?',
        option1: '1',
        option2: '2',
        option3: '3',
        option4: '4',
        answer: '1',
        difficulty: 'hard'
      });
      
      mockFlashcardService.update.and.returnValue(of({}));
      
      component.submit();
      
      expect(mockFlashcardService.update).toHaveBeenCalled();
      expect(mockFlashcardService.add).not.toHaveBeenCalled();
    });

    it('should pass correct parameters to update service', () => {
      component.form.patchValue({
        subject: 'Physics',
        question: 'What is velocity?',
        option1: 'A',
        option2: 'B',
        option3: 'C',
        option4: 'D',
        answer: 'A',
        difficulty: 'hard'
      });
      
      mockFlashcardService.update.and.returnValue(of({}));
      
      component.submit();
      
      expect(mockFlashcardService.update).toHaveBeenCalledWith('card1', {
        subject: 'Physics',
        question: 'What is velocity?',
        options: ['A', 'B', 'C', 'D'],
        answer: 'A',
        difficulty: 'hard'
      });
    });

    it('should show success message for update', (done) => {
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
      
      mockFlashcardService.update.and.returnValue(of({}));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.success).toBe('Question updated!');
        done();
      }, 0);
    });

    it('should use update error message', (done) => {
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
      
      mockFlashcardService.update.and.returnValue(throwError(() => new Error('Error')));
      
      component.submit();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to update question');
        done();
      }, 0);
    });

    it('should handle missing options array in loaded flashcard', (done) => {
      const cardWithoutOptions = { ...mockFlashcard, options: undefined };
      mockFlashcardService.getById.and.returnValue(of(cardWithoutOptions));
      
      component['loadFlashcardForEdit']('card1');
      
      setTimeout(() => {
        expect(component.form.value.option1).toBe('');
        expect(component.form.value.option2).toBe('');
        expect(component.form.value.option3).toBe('');
        expect(component.form.value.option4).toBe('');
        done();
      }, 0);
    });

    it('should handle partial options array in loaded flashcard', (done) => {
      const cardWithPartialOptions = { ...mockFlashcard, options: ['3', '4'] };
      mockFlashcardService.getById.and.returnValue(of(cardWithPartialOptions));
      
      component['loadFlashcardForEdit']('card1');
      
      setTimeout(() => {
        expect(component.form.value.option1).toBe('3');
        expect(component.form.value.option2).toBe('4');
        expect(component.form.value.option3).toBe('');
        expect(component.form.value.option4).toBe('');
        done();
      }, 0);
    });

    it('should handle load error', (done) => {
      const error = { error: { error: 'Flashcard not found' } };
      mockFlashcardService.getById.and.returnValue(throwError(() => error));
      
      component['loadFlashcardForEdit']('card1');
      
      setTimeout(() => {
        expect(component.error).toBe('Flashcard not found');
        done();
      }, 0);
    });
  });

  describe('Option Value Getters', () => {
    it('should get option1 value', () => {
      component.form.patchValue({ option1: 'Value1' });
      expect(component.option1Value).toBe('Value1');
    });

    it('should get option2 value', () => {
      component.form.patchValue({ option2: 'Value2' });
      expect(component.option2Value).toBe('Value2');
    });

    it('should get option3 value', () => {
      component.form.patchValue({ option3: 'Value3' });
      expect(component.option3Value).toBe('Value3');
    });

    it('should get option4 value', () => {
      component.form.patchValue({ option4: 'Value4' });
      expect(component.option4Value).toBe('Value4');
    });

    it('should return empty string for null option value', () => {
      component.form.patchValue({ option1: null });
      expect(component.option1Value).toBe('');
    });
  });

  describe('Form Error Clearing', () => {
    it('should clear error when starting submission', () => {
      component.error = 'Previous error';
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      expect(component.error).toBeNull();
    });

    it('should clear success message when starting submission', () => {
      component.success = 'Previous success';
      component.form.patchValue({
        subject: 'Math',
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        answer: '4',
        difficulty: 'easy'
      });
      mockFlashcardService.add.and.returnValue(of({}));
      
      component.submit();
      
      expect(component.success).toBeNull();
    });
  });
});
