import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Profile } from './profile';
import { AuthService } from '../../services/auth.service';

describe('Profile Component', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProfileData = {
    email: 'user@example.com',
    profile: {
      firstName: 'John',
      lastName: 'Doe'
    },
    role: 'user',
    stats: {
      quizzesCompleted: 5,
      flashcardsCreated: 10
    }
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Profile, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with null user and empty error', () => {
      expect(component.user).toBeNull();
      expect(component.error).toBe('');
      expect(component.loading).toBe(true);
    });

    it('should redirect to login if no token exists', () => {
      mockAuthService.getToken.and.returnValue(null);
      
      component.ngOnInit();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not attempt profile fetch if redirected to login', () => {
      mockAuthService.getToken.and.returnValue(null);
      
      component.ngOnInit();
      
      const reqs = httpMock.match('http://localhost:8000/users/profile');
      expect(reqs.length).toBe(0);
    });

    it('should fetch user profile when token exists', () => {
      mockAuthService.getToken.and.returnValue('token123');
      
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('Profile Loading - Successful', () => {
    beforeEach(() => {
      mockAuthService.getToken.and.returnValue('token123');
    });

    it('should load profile data on successful response', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(mockProfileData);
      
      expect(component.user).toEqual({
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        stats: mockProfileData.stats
      });
    });

    it('should set loading to false after successful load', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(mockProfileData);
      
      expect(component.loading).toBe(false);
    });

    it('should clear error message on successful load', () => {
      component.error = 'Previous error';
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(mockProfileData);
      
      expect(component.error).toBe('');
    });

    it('should handle missing profile object', () => {
      const dataWithoutProfile = { ...mockProfileData, profile: undefined };
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(dataWithoutProfile);
      
      expect(component.user.firstName).toBe('-');
      expect(component.user.lastName).toBe('-');
    });

    it('should handle missing profile fields', () => {
      const dataWithPartialProfile = {
        ...mockProfileData,
        profile: { firstName: 'John' }
      };
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(dataWithPartialProfile);
      
      expect(component.user.firstName).toBe('John');
      expect(component.user.lastName).toBe('-');
    });

    it('should default role to "user" if missing', () => {
      const dataWithoutRole = { ...mockProfileData, role: undefined };
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(dataWithoutRole);
      
      expect(component.user.role).toBe('user');
    });

    it('should include stats in user object', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(mockProfileData);
      
      expect(component.user.stats).toEqual(mockProfileData.stats);
    });
  });

  describe('Profile Loading - Error Cases', () => {
    beforeEach(() => {
      mockAuthService.getToken.and.returnValue('token123');
    });

    it('should display error message from backend', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush({ error: 'User not found' }, { status: 404, statusText: 'Not Found' });
      
      expect(component.error).toBe('User not found');
    });

    it('should display default error message when backend error missing', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.error(new ErrorEvent('Network error'));
      
      expect(component.error).toBe('Failed to load profile');
    });

    it('should set loading to false on error', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.error(new ErrorEvent('Network error'));
      
      expect(component.loading).toBe(false);
    });

    it('should handle 401 unauthorized response', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      
      expect(component.error).toBe('Unauthorized');
    });

    it('should handle 500 server error', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush({ error: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
      
      expect(component.error).toBe('Internal server error');
    });

    it('should handle malformed response', () => {
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush({ email: 'test@example.com' }, { status: 200, statusText: 'OK' });
      
      expect(component.user.email).toBe('test@example.com');
    });
  });

  describe('Logout Functionality', () => {
    it('should call auth service logout method', () => {
      component.logout();
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should logout at any time', () => {
      mockAuthService.getToken.and.returnValue('token123');
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(mockProfileData);
      
      component.logout();
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('User Data Transformation', () => {
    beforeEach(() => {
      mockAuthService.getToken.and.returnValue('token123');
    });

    it('should transform API response to component user object', () => {
      const apiResponse = {
        email: 'john.doe@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        role: 'admin',
        stats: {
          quizzesCompleted: 10,
          totalScore: 850
        }
      };
      
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(apiResponse);
      
      expect(component.user).toEqual({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        stats: apiResponse.stats
      });
    });

    it('should maintain backwards compatibility with missing profile object', () => {
      const apiResponse = {
        email: 'user@example.com',
        role: 'user'
      };
      
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(apiResponse);
      
      expect(component.user.firstName).toBe('-');
      expect(component.user.lastName).toBe('-');
    });

    it('should preserve complete stats object', () => {
      const statsData = {
        quizzesCompleted: 15,
        quizzesFailed: 3,
        totalScore: 1200,
        bestScore: 95,
        flashcardsCreated: 25
      };
      
      const apiResponse = { ...mockProfileData, stats: statsData };
      
      component.ngOnInit();
      
      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush(apiResponse);
      
      expect(component.user.stats).toEqual(statsData);
    });
  });
});
