import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Register } from './register';
import { AuthService } from '../../services/auth.service';

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
  });

  describe('Form Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with email, password, firstName, and lastName fields', () => {
      expect(component.form.get('email')).toBeTruthy();
      expect(component.form.get('password')).toBeTruthy();
      expect(component.form.get('firstName')).toBeTruthy();
      expect(component.form.get('lastName')).toBeTruthy();
    });

    it('should start with form invalid (no values)', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should start with no error and not loading', () => {
      expect(component.error).toBe('');
      expect(component.loading).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should require email field', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.form.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should accept valid email format', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should require password field', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should accept any non-empty password', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('anypassword');
      expect(passwordControl?.valid).toBe(true);
    });
  });

  describe('Form Submission - Valid Form', () => {
    beforeEach(() => {
      component.form.patchValue({
        email: 'newuser@example.com',
        password: 'securepassword',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should call authService.register with form data on valid submission', async () => {
      mockAuthService.register.and.returnValue(Promise.resolve());
      
      await component.register();
      
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securepassword',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should navigate to login on successful registration', async () => {
      mockAuthService.register.and.returnValue(Promise.resolve());
      
      await component.register();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set loading to true during registration', async () => {
      mockAuthService.register.and.returnValue(new Promise(resolve => {
        setTimeout(() => resolve(), 100);
      }));
      
      const registerPromise = component.register();
      expect(component.loading).toBe(true);
      
      await registerPromise;
      expect(component.loading).toBe(false);
    });

    it('should clear error message on successful registration', async () => {
      component.error = 'Previous error';
      mockAuthService.register.and.returnValue(Promise.resolve());
      
      await component.register();
      
      expect(component.error).toBe('');
    });
  });

  describe('Form Submission - Invalid Form', () => {
    it('should not submit if email is missing', async () => {
      component.form.patchValue({
        email: '',
        password: 'securepassword'
      });
      
      await component.register();
      
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should not submit if password is missing', async () => {
      component.form.patchValue({
        email: 'test@example.com',
        password: ''
      });
      
      await component.register();
      
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should set error message when form is invalid', async () => {
      component.form.patchValue({
        email: '',
        password: ''
      });
      
      await component.register();
      
      expect(component.error).toBe('Please fill all required fields.');
    });

    it('should set loading to false when form is invalid', async () => {
      component.form.patchValue({
        email: '',
        password: ''
      });
      
      await component.register();
      
      expect(component.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.form.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should display error message from backend response', async () => {
      const error = { error: { error: 'Email already registered' } };
      mockAuthService.register.and.returnValue(Promise.reject(error));
      
      await component.register();
      
      expect(component.error).toBe('Email already registered');
    });

    it('should display generic error when backend error missing', async () => {
      const error = new Error('Network error');
      mockAuthService.register.and.returnValue(Promise.reject(error));
      
      await component.register();
      
      expect(component.error).toBe('Registration failed');
    });

    it('should set loading to false on error', async () => {
      mockAuthService.register.and.returnValue(Promise.reject({ error: { error: 'Failed' } }));
      
      await component.register();
      
      expect(component.loading).toBe(false);
    });

    it('should clear previous error when attempting new registration', async () => {
      component.error = 'Previous error';
      mockAuthService.register.and.returnValue(Promise.resolve());
      
      await component.register();
      
      expect(component.error).toBe('');
    });
  });

  describe('Optional Fields', () => {
    it('should not require firstName', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.valid).toBe(true);
    });

    it('should not require lastName', () => {
      const lastNameControl = component.form.get('lastName');
      lastNameControl?.setValue('');
      expect(lastNameControl?.valid).toBe(true);
    });

    it('should allow registration with only email and password', async () => {
      component.form.patchValue({
        email: 'minimal@example.com',
        password: 'pass123',
        firstName: '',
        lastName: ''
      });
      
      mockAuthService.register.and.returnValue(Promise.resolve());
      
      await component.register();
      
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'minimal@example.com',
        password: 'pass123',
        firstName: '',
        lastName: ''
      });
    });
  });
});
