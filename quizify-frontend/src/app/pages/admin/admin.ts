import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  users: any[] = [];
  error = '';
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data.users || data;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.error || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  deleteUser(id: string) {
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to delete user';
      }
    });
  }

  promoteUser(id: string) {
    this.adminService.promoteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to promote user';
      }
    });
  }
}
