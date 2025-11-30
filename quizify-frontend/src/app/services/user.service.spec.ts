import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProfile', () => {
    it('should fetch user profile', () => {
      const mockProfile = {
        id: '1',
        email: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' },
        stats: { totalFlashcards: 50, quizzesTaken: 10 }
      };

      service.getProfile().subscribe(profile => {
        expect(profile).toEqual(mockProfile);
        expect((profile as any).email).toBe('user@example.com');
      });

      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('should handle profile fetch error', () => {
      service.getProfile().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const updateData = { 
        profile: { firstName: 'Jane', lastName: 'Smith' }
      };
      const mockResponse = { 
        id: '1', 
        email: 'user@example.com',
        ...updateData
      };

      service.updateProfile(updateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('should handle profile update error', () => {
      const updateData = { profile: { firstName: '' } };

      service.updateProfile(updateData).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/users/profile');
      req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' },
        role: 'user'
      };

      service.getUserById('1').subscribe((user: any) => {
        expect(user).toEqual(mockUser);
        expect(user.email).toBe('user@example.com');
      });

      const req = httpMock.expectOne('http://localhost:8000/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle user not found error', () => {
      service.getUserById('nonexistent').subscribe(
        () => fail('should have failed'),
        (error: any) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/users/nonexistent');
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
