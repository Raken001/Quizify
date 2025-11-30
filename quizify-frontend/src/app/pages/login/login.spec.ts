import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout',
      'isLoggedIn'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty email and password', () => {
    fixture.detectChanges();
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should mark email as invalid when empty', () => {
    fixture.detectChanges();
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should mark email as invalid with improper format', () => {
    fixture.detectChanges();
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalidemail');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should mark email as valid with proper format', () => {
    fixture.detectChanges();
    const emailControl = component.form.get('email');
    emailControl?.setValue('user@example.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should mark password as invalid when empty', () => {
    fixture.detectChanges();
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('');
    passwordControl?.markAsTouched();
    expect(passwordControl?.hasError('required')).toBeTruthy();
  });

  it('should mark password as valid when not empty', () => {
    fixture.detectChanges();
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('password123');
    expect(passwordControl?.hasError('required')).toBeFalsy();
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');
    fixture.detectChanges();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    fixture.detectChanges();
    component.form.get('email')?.setValue('user@example.com');
    component.form.get('password')?.setValue('password123');
    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
  });

  it('should call authService.login with form values on submit', async () => {
    fixture.detectChanges();
    authService.login.and.returnValue(Promise.resolve());
    
    component.form.get('email')?.setValue('user@example.com');
    component.form.get('password')?.setValue('password123');
    
    await component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
  });

  it('should navigate to flashcards on successful login', async () => {
    fixture.detectChanges();
    authService.login.and.returnValue(Promise.resolve());
    
    component.form.get('email')?.setValue('user@example.com');
    component.form.get('password')?.setValue('password123');
    
    await component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/flashcards']);
  });

  it('should handle login error gracefully', async () => {
    fixture.detectChanges();
    authService.login.and.returnValue(Promise.reject({ error: { message: 'Invalid credentials' } }));
    
    component.form.get('email')?.setValue('user@example.com');
    component.form.get('password')?.setValue('wrongpassword');
    
    await component.onSubmit();
    
    expect(component.error).toBeDefined();
    expect(component.error).toContain('Invalid credentials');
  });
});
