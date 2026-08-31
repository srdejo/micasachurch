import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'micasachurch_admin_token';
const USERNAME_KEY = 'micasachurch_admin_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly username = signal<string | null>(this.readStorage(USERNAME_KEY));

  login(username: string, password: string) {
    return this.http
      .post<{ success: boolean; data: { token: string; username: string } }>(
        `${environment.apiUrl}/admin/auth/login`,
        { username, password },
      )
      .pipe(
        tap((res) => {
          this.storeToken(res.data.token);
          this.storeUsername(res.data.username);
        }),
      );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USERNAME_KEY);
    }
    this.username.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.readStorage(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private storeToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private storeUsername(username: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USERNAME_KEY, username);
    }
    this.username.set(username);
  }

  private readStorage(key: string): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
}
