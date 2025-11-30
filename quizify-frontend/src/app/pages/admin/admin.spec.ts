import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from './admin';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';

describe('Admin Component', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockUsers = [
    { _id: 'user1', email: 'user1@example.com', role: 'user' },
    { _id: 'user2', email: 'user2@example.com', role: 'user' },
    { _id: 'user3', email: 'admin@example.com', role: 'admin' }
  ];

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'getUsers',
      'deleteUser',
      'promoteUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [{ provide: AdminService, useValue: mockAdminService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty state', () => {
      expect(component.users).toEqual([]);
      expect(component.error).toBe('');
      expect(component.loading).toBe(false);
    });

    it('should load users on ngOnInit', () => {
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.ngOnInit();
      
      expect(mockAdminService.getUsers).toHaveBeenCalled();
    });
  });

  describe('Loading Users', () => {
    it('should load users from service', (done) => {
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.load();
      
      setTimeout(() => {
        expect(component.users).toEqual(mockUsers);
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should handle users response without wrapper object', (done) => {
      mockAdminService.getUsers.and.returnValue(of(mockUsers));
      
      component.load();
      
      setTimeout(() => {
        expect(component.users).toEqual(mockUsers);
        done();
      }, 0);
    });

    it('should set loading to true during fetch', () => {
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.load();
      
      expect(component.loading).toBe(true);
    });

    it('should clear error on successful load', (done) => {
      component.error = 'Previous error';
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.load();
      
      setTimeout(() => {
        expect(component.error).toBe('');
        done();
      }, 0);
    });

    it('should handle user load error', (done) => {
      const error = { error: { error: 'Permission denied' } };
      mockAdminService.getUsers.and.returnValue(throwError(() => error));
      
      component.load();
      
      setTimeout(() => {
        expect(component.error).toBe('Permission denied');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should use default error message when backend error missing', (done) => {
      mockAdminService.getUsers.and.returnValue(throwError(() => new Error('Network error')));
      
      component.load();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to load users');
        done();
      }, 0);
    });

    it('should handle empty users list', (done) => {
      mockAdminService.getUsers.and.returnValue(of({ users: [] }));
      
      component.load();
      
      setTimeout(() => {
        expect(component.users).toEqual([]);
        done();
      }, 0);
    });
  });

  describe('Deleting Users', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should show confirmation dialog before deletion', () => {
      component.deleteUser('user1');
      
      expect(window.confirm).toHaveBeenCalled();
    });

    it('should not delete if user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.deleteUser('user1');
      
      expect(mockAdminService.deleteUser).not.toHaveBeenCalled();
    });

    it('should call deleteUser service with correct ID', () => {
      mockAdminService.deleteUser.and.returnValue(of({}));
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.deleteUser('user1');
      
      expect(mockAdminService.deleteUser).toHaveBeenCalledWith('user1');
    });

    it('should reload users after successful deletion', (done) => {
      mockAdminService.deleteUser.and.returnValue(of({}));
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.deleteUser('user1');
      
      setTimeout(() => {
        expect(mockAdminService.getUsers).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle deletion error', (done) => {
      const error = { error: { error: 'Cannot delete user' } };
      mockAdminService.deleteUser.and.returnValue(throwError(() => error));
      
      component.deleteUser('user1');
      
      setTimeout(() => {
        expect(component.error).toBe('Cannot delete user');
        done();
      }, 0);
    });

    it('should use default error message on deletion failure', (done) => {
      mockAdminService.deleteUser.and.returnValue(throwError(() => new Error('Error')));
      
      component.deleteUser('user1');
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to delete user');
        done();
      }, 0);
    });

    it('should show proper confirmation message', () => {
      component.deleteUser('user1');
      
      const confirmMessage = (window.confirm as jasmine.Spy).calls.argsFor(0)[0];
      expect(confirmMessage).toContain('delete this user');
      expect(confirmMessage).toContain('cannot be undone');
    });
  });

  describe('Promoting Users', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should show confirmation dialog before promotion', () => {
      mockAdminService.promoteUser.and.returnValue(of({}));
      
      component.promoteUser('user1');
      
      expect(window.confirm).toHaveBeenCalled();
    });

    it('should not promote if user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.promoteUser('user1');
      
      expect(mockAdminService.promoteUser).not.toHaveBeenCalled();
    });

    it('should call promoteUser service with correct ID', () => {
      mockAdminService.promoteUser.and.returnValue(of({}));
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.promoteUser('user1');
      
      expect(mockAdminService.promoteUser).toHaveBeenCalledWith('user1');
    });

    it('should reload users after successful promotion', (done) => {
      mockAdminService.promoteUser.and.returnValue(of({}));
      mockAdminService.getUsers.and.returnValue(of({ users: mockUsers }));
      
      component.promoteUser('user1');
      
      setTimeout(() => {
        expect(mockAdminService.getUsers).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle promotion error', (done) => {
      const error = { error: { error: 'User already admin' } };
      mockAdminService.promoteUser.and.returnValue(throwError(() => error));
      
      component.promoteUser('user1');
      
      setTimeout(() => {
        expect(component.error).toBe('User already admin');
        done();
      }, 0);
    });

    it('should use default error message on promotion failure', (done) => {
      mockAdminService.promoteUser.and.returnValue(throwError(() => new Error('Error')));
      
      component.promoteUser('user1');
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to promote user');
        done();
      }, 0);
    });

    it('should show proper confirmation message', () => {
      mockAdminService.promoteUser.and.returnValue(of({}));
      
      component.promoteUser('user1');
      
      const confirmMessage = (window.confirm as jasmine.Spy).calls.argsFor(0)[0];
      expect(confirmMessage).toContain('promote this user to admin');
      expect(confirmMessage).toContain('admin features');
    });
  });
});
