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
   * Shows confirmation dialog before deletion
   * Reloads user list after successful deletion
   * 
   * @param id - User ID to delete
   */
  deleteUser(id: string) {
    const confirmed = confirm('Are you sure you want to delete this user? This action cannot be undone. All their flashcards and quiz data will also be deleted.');
    if (!confirmed) return;
    
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to delete user';
      }
    });
  }

  /**
   * Promotes a user to admin role
   * Shows confirmation dialog before promotion
   * Changes user's role from 'user' to 'admin'
   * Reloads user list after successful promotion
   * 
   * @param id - User ID to promote to admin
   */
  promoteUser(id: string) {
    const confirmed = confirm('Are you sure you want to promote this user to admin? They will have access to admin features.');
    if (!confirmed) return;
    
    this.adminService.promoteUser(id).subscribe({
      next: () => this.load(),
      error: err => {
        this.error = err?.error?.error || 'Failed to promote user';
      }
    });
  }
}
