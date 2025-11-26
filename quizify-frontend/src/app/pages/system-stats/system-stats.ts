import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalFlashcards: number;
  newFlashcards: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageQuizScore: number;
  totalStudyTime: number;
}

interface StatsResponse {
  today: {
    stats: Stats;
  };
  overall: {
    totalUsers: number;
    totalFlashcards: number;
    totalQuizzes: number;
  };
}

@Component({
  selector: 'app-system-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-stats.html',
  styleUrl: './system-stats.css',
})
export class SystemStats implements OnInit {
  todayStats: Stats | null = null;
  overallStats: any = null;
  loading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = null;
    this.adminService.getStats().subscribe({
      next: (data: any) => {
        this.todayStats = data.today.stats;
        this.overallStats = data.overall;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.error || 'Failed to load statistics';
        this.loading = false;
      }
    });
  }

  formatStudyTime(seconds: number): string {
    if (seconds === 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
