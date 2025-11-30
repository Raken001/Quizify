import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { AdminGuard } from './admin.guard';
import { of } from 'rxjs';

describe('AdminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: router }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access for authenticated admin users', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    userServiceSpy.getProfile.and.returnValue(of({ role: 'admin' }));

    const result = TestBed.runInInjectionContext(() => AdminGuard(null as any, null as any));

    expect(result).toBeTruthy();
  });

  it('should deny access if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => AdminGuard(null as any, null as any));

    expect(result).toBeFalsy();
  });

  it('should deny access if user is not admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    userServiceSpy.getProfile.and.returnValue(of({ role: 'user' }));

    const result = TestBed.runInInjectionContext(() => AdminGuard(null as any, null as any));

    expect(result).toBeFalsy();
  });
});
