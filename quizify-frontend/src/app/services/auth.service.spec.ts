import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('register', () => {
    it('should send registration data to API', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const registerPromise = service.register(registerData);

      const req = httpMock.expectOne('http://localhost:8000/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);

      req.flush({});
      await registerPromise;
    });

    it('should throw error if registration fails', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const registerPromise = service.register(registerData);

      const req = httpMock.expectOne('http://localhost:8000/auth/register');
      req.error(new ErrorEvent('Registration failed'));

      try {
        await registerPromise;
        fail('should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('login', () => {
    it('should login user and store token', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };
      const mockToken = 'mock_jwt_token';

      const loginPromise = service.login(loginData);

      const req = httpMock.expectOne('http://localhost:8000/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);

      req.flush({ token: mockToken });
      await loginPromise;

      expect(localStorage.getItem('quizify_token')).toBe(mockToken);
    });

    it('should emit auth state change on successful login', async () => {
      let authState: boolean | null = null;
      const subscription = service.authStateChanged$.subscribe(state => {
        authState = state;
      });

      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const loginPromise = service.login(loginData);

      const req = httpMock.expectOne('http://localhost:8000/auth/login');
      req.flush({ token: 'mock_token' });
      await loginPromise;

      expect(authState).toBe(true as any);
      subscription.unsubscribe();
    });
  });

  describe('logout', () => {
    it('should clear token and emit auth state change', () => {
      localStorage.setItem('quizify_token', 'mock_token');

      let authState: boolean | null = null;
      const subscription = service.authStateChanged$.subscribe(state => {
        authState = state;
      });

      service.logout();

      expect(localStorage.getItem('quizify_token')).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      subscription.unsubscribe();
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      const token = 'mock_token_value';
      localStorage.setItem('quizify_token', token);

      expect(service.getToken()).toBe(token);
    });

    it('should return null if no token stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('quizify_token', 'mock_token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if no token exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
