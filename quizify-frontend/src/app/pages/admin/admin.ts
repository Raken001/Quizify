import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { SystemStats } from '../system-stats/system-stats';

/**
 * Admin Dashboard Component
 * 
 * Displays admin panel with user management capabilities
 * Shows all registered users with their information
 * Provides ability to delete users and promote them to admin role
 * Includes embedded system statistics component
 * 
 * Protected by AdminGuard - only accessible to users with admin role
 */
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

  /**
   * Initialize component - load user list on component creation
   */
  ngOnInit() {
    this.load();
  }

  /**
   * Loads the list of all registered users
   * Fetches user data from admin service and populates users array
   * Manages loading and error states
   */
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

  /**
   * Deletes a user account by ID
   * Reloads user list after successful deletion
   * 
   * @param id - User ID to delete
   */
  deleteUser(id: string) {
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to delete user';
      }
    });
  }

  /**
   * Promotes a user to admin role
   * Changes user's role from 'user' to 'admin'
   * Reloads user list after successful promotion
   * 
   * @param id - User ID to promote to admin
   */
  promoteUser(id: string) {
    this.adminService.promoteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to promote user';
      }
    });
  }
}
