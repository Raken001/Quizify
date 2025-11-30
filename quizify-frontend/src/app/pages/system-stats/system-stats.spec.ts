import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemStats } from './system-stats';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';

describe('SystemStats Component', () => {
  let component: SystemStats;
  let fixture: ComponentFixture<SystemStats>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockStatsResponse = {
    today: {
      stats: {
        totalUsers: 50,
        activeUsers: 30,
        newUsers: 5,
        totalFlashcards: 500,
        newFlashcards: 20,
        totalQuizzes: 150,
        completedQuizzes: 120,
        averageQuizScore: 75.5,
        totalStudyTime: 36000
      }
    },
    overall: {
      totalUsers: 100,
      totalFlashcards: 1000,
      totalQuizzes: 300
    }
  };

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getStats']);

    await TestBed.configureTestingModule({
      imports: [SystemStats],
      providers: [{ provide: AdminService, useValue: mockAdminService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with null stats and no error', () => {
      expect(component.todayStats).toBeNull();
      expect(component.overallStats).toBeNull();
      expect(component.error).toBeNull();
      expect(component.loading).toBe(false);
    });

    it('should load stats on ngOnInit', () => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.ngOnInit();
      
      expect(mockAdminService.getStats).toHaveBeenCalled();
    });
  });

  describe('Loading Stats', () => {
    it('should fetch stats from admin service', () => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      expect(mockAdminService.getStats).toHaveBeenCalled();
    });

    it('should set loading to true during fetch', () => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      expect(component.loading).toBe(true);
    });

    it('should load today stats on successful response', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.todayStats).toEqual(mockStatsResponse.today.stats);
        done();
      }, 0);
    });

    it('should load overall stats on successful response', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.overallStats).toEqual(mockStatsResponse.overall);
        done();
      }, 0);
    });

    it('should set loading to false after successful load', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should clear error on successful load', (done) => {
      component.error = 'Previous error';
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.error).toBeNull();
        done();
      }, 0);
    });

    it('should set error to null when starting load', () => {
      component.error = 'Previous error';
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      expect(component.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should display error message from backend', (done) => {
      const error = { error: { error: 'Insufficient permissions' } };
      mockAdminService.getStats.and.returnValue(throwError(() => error));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.error).toBe('Insufficient permissions');
        done();
      }, 0);
    });

    it('should display default error message when backend error missing', (done) => {
      mockAdminService.getStats.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.error).toBe('Failed to load statistics');
        done();
      }, 0);
    });

    it('should set loading to false on error', (done) => {
      mockAdminService.getStats.and.returnValue(throwError(() => new Error('Error')));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should maintain error state after failed load', (done) => {
      const error = { error: { error: 'Service unavailable' } };
      mockAdminService.getStats.and.returnValue(throwError(() => error));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.error).toBe('Service unavailable');
        expect(component.todayStats).toBeNull();
        expect(component.overallStats).toBeNull();
        done();
      }, 0);
    });
  });

  describe('Study Time Formatting', () => {
    it('should format zero seconds as "0m"', () => {
      const formatted = component.formatStudyTime(0);
      expect(formatted).toBe('0m');
    });

    it('should format seconds only (less than 60 seconds)', () => {
      const formatted = component.formatStudyTime(30);
      expect(formatted).toBe('0m');
    });

    it('should format minutes only (less than 1 hour)', () => {
      const formatted = component.formatStudyTime(600); // 10 minutes
      expect(formatted).toBe('10m');
    });

    it('should format hours and minutes', () => {
      const formatted = component.formatStudyTime(3660); // 1h 1m
      expect(formatted).toBe('1h 1m');
    });

    it('should format multiple hours with minutes', () => {
      const formatted = component.formatStudyTime(7260); // 2h 1m
      expect(formatted).toBe('2h 1m');
    });

    it('should format 1 hour exactly', () => {
      const formatted = component.formatStudyTime(3600); // exactly 1 hour
      expect(formatted).toBe('1h 0m');
    });

    it('should handle large study times', () => {
      const formatted = component.formatStudyTime(36000); // 10 hours
      expect(formatted).toBe('10h 0m');
    });

    it('should format the mock study time correctly', () => {
      const formatted = component.formatStudyTime(mockStatsResponse.today.stats.totalStudyTime);
      expect(formatted).toBe('10h 0m');
    });

    it('should handle 59 seconds and 59 minutes', () => {
      const seconds = 59 + (59 * 60); // 59m 59s
      const formatted = component.formatStudyTime(seconds);
      expect(formatted).toBe('59m');
    });

    it('should format 1 hour 30 minutes correctly', () => {
      const formatted = component.formatStudyTime(5400); // 1h 30m
      expect(formatted).toBe('1h 30m');
    });
  });

  describe('Stats Data Integrity', () => {
    it('should preserve all today stats fields', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        const stats = component.todayStats;
        expect(stats?.totalUsers).toBe(50);
        expect(stats?.activeUsers).toBe(30);
        expect(stats?.newUsers).toBe(5);
        expect(stats?.totalFlashcards).toBe(500);
        expect(stats?.newFlashcards).toBe(20);
        expect(stats?.totalQuizzes).toBe(150);
        expect(stats?.completedQuizzes).toBe(120);
        expect(stats?.averageQuizScore).toBe(75.5);
        expect(stats?.totalStudyTime).toBe(36000);
        done();
      }, 0);
    });

    it('should preserve all overall stats fields', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        const stats = component.overallStats;
        expect(stats.totalUsers).toBe(100);
        expect(stats.totalFlashcards).toBe(1000);
        expect(stats.totalQuizzes).toBe(300);
        done();
      }, 0);
    });

    it('should handle response with different numeric values', (done) => {
      const customResponse = {
        today: {
          stats: {
            totalUsers: 999,
            activeUsers: 888,
            newUsers: 77,
            totalFlashcards: 6666,
            newFlashcards: 555,
            totalQuizzes: 4444,
            completedQuizzes: 3333,
            averageQuizScore: 99.9,
            totalStudyTime: 999999
          }
        },
        overall: {
          totalUsers: 5000,
          totalFlashcards: 50000,
          totalQuizzes: 25000
        }
      };
      
      mockAdminService.getStats.and.returnValue(of(customResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.todayStats).toEqual(customResponse.today.stats);
        expect(component.overallStats).toEqual(customResponse.overall);
        done();
      }, 0);
    });
  });

  describe('Multiple Loads', () => {
    it('should allow reloading stats', (done) => {
      mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.todayStats?.totalUsers).toBe(50);
        
        const updatedResponse = {
          ...mockStatsResponse,
          today: {
            stats: { ...mockStatsResponse.today.stats, totalUsers: 60 }
          }
        };
        
        mockAdminService.getStats.and.returnValue(of(updatedResponse));
        component.loadStats();
        
        setTimeout(() => {
          expect(component.todayStats?.totalUsers).toBe(60);
          done();
        }, 0);
      }, 0);
    });

    it('should reset error state on reload after error', (done) => {
      const error = { error: { error: 'Network error' } };
      mockAdminService.getStats.and.returnValue(throwError(() => error));
      
      component.loadStats();
      
      setTimeout(() => {
        expect(component.error).toBe('Network error');
        
        mockAdminService.getStats.and.returnValue(of(mockStatsResponse));
        component.loadStats();
        
        setTimeout(() => {
          expect(component.error).toBeNull();
          expect(component.todayStats).not.toBeNull();
          done();
        }, 0);
      }, 0);
    });
  });
});
