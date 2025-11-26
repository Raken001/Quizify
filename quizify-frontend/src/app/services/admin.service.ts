import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:8000/admin';

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get(`${this.api}/stats`);
  }

  getUsers() {
    return this.http.get(`${this.api}/users`);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.api}/users/${id}`);
  }

  promoteUser(id: string) {
    return this.http.put(`${this.api}/users/${id}/role`, { role: 'admin' });
  }
}
