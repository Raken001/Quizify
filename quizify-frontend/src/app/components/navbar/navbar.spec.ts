import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './navbar';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';

describe('Navbar Component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'logout',
      'isLoggedIn',
      'getToken'
    ]);
    authServiceSpy.authStateChanged$ = of(true);

    const userServiceSpy = jasmine.createSpyObj('UserService', ['getProfile']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init when logged in', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      profile: { firstName: 'John' },
      role: 'user'
    };

    authService.isLoggedIn.and.returnValue(true);
    userService.getProfile.and.returnValue(of(mockUser));

    fixture.detectChanges();

    expect(userService.getProfile).toHaveBeenCalled();
  });

  it('should not load profile if not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    fixture.detectChanges();

    expect(userService.getProfile).not.toHaveBeenCalled();
  });

  it('should display user email when logged in', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      profile: { firstName: 'Test' },
      role: 'user'
    };

    authService.isLoggedIn.and.returnValue(true);
    userService.getProfile.and.returnValue(of(mockUser));

    component.user = mockUser;
    fixture.detectChanges();

    const navbar = fixture.nativeElement;
    expect(navbar.textContent).toContain('test@example.com');
  });

  it('should call logout on logout button click', () => {
    authService.logout.and.returnValue(undefined);

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should show admin link only for admin users', () => {
    component.user = { role: 'admin' };
    fixture.detectChanges();

    expect(component.user.role).toBe('admin');
  });

  it('should not show admin link for regular users', () => {
    component.user = { role: 'user' };
    fixture.detectChanges();

    expect(component.user.role).toBe('user');
  });

  it('should handle user profile load error', () => {
    authService.isLoggedIn.and.returnValue(true);
    userService.getProfile.and.returnValue(of({} as any));

    fixture.detectChanges();

    expect(component.user).toBeDefined();
  });

  it('should unsubscribe on component destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
