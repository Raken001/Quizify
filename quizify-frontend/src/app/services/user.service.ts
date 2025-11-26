import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * UserService
 * Handles all user-related API calls including profile fetching and updates
 * Provides a centralized place for user data management
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private api = 'http://localhost:8000/users';

  constructor(private http: HttpClient) {}

  /**
   * Fetches the current logged-in user's profile information
   * @returns Observable containing user profile data (email, firstName, lastName, role, stats)
   */
  getProfile() {
    return this.http.get(`${this.api}/profile`);
  }

  /**
   * Updates the current user's profile information
   * @param data - Profile data to update (firstName, lastName, avatar, bio, etc.)
   * @returns Observable containing updated user profile
   */
  updateProfile(data: any) {
    return this.http.put(`${this.api}/profile`, data);
  }

  /**
   * Fetches a specific user by ID (admin use)
   * @param id - User ID to fetch
   * @returns Observable containing user data
   */
  getUserById(id: string) {
    return this.http.get(`${this.api}/${id}`);
  }
}
