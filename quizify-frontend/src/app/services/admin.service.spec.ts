import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getStats', () => {
    it('should fetch admin statistics', () => {
      const mockStats = {
        totalUsers: 100,
        totalFlashcards: 500,
        totalQuizzes: 1000,
        averageScore: 75.5
      };

      service.getStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
        expect((stats as any).totalUsers).toBe(100);
      });

      const req = httpMock.expectOne('http://localhost:8000/admin/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should handle stats fetch error', () => {
      service.getStats().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/admin/stats');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getUsers', () => {
    it('should fetch all users', () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', role: 'user' },
        { id: '2', email: 'user2@example.com', role: 'user' },
        { id: '3', email: 'admin@example.com', role: 'admin' }
      ];

      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect((users as any[]).length).toBe(3);
      });

      const req = httpMock.expectOne('http://localhost:8000/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should return empty array if no users', () => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne('http://localhost:8000/admin/users');
      req.flush([]);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by ID', () => {
      service.deleteUser('1').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne('http://localhost:8000/admin/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle delete error', () => {
      service.deleteUser('1').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/admin/users/1');
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('promoteUser', () => {
    it('should promote user to admin', () => {
      const mockResponse = { id: '1', email: 'user@example.com', role: 'admin' };

      service.promoteUser('1').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect((response as any).role).toBe('admin');
      });

      const req = httpMock.expectOne('http://localhost:8000/admin/users/1/role');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ role: 'admin' });
      req.flush(mockResponse);
    });

    it('should handle promotion error', () => {
      service.promoteUser('1').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('http://localhost:8000/admin/users/1/role');
      req.flush('Invalid role', { status: 400, statusText: 'Bad Request' });
    });
  });
});
