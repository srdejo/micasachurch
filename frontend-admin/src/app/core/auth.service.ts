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

  /** Salida voluntaria: el admin hace clic en "Cerrar sesión". */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Salida forzada: el token venció o el backend lo rechazó con 401. Se distingue de
   * `logout()` para poder avisar en el login por qué se cerró la sesión, en vez de
   * dejar al admin en una pantalla que falla en silencio.
   */
  sessionExpired(): void {
    if (!this.getToken() && this.router.url.startsWith('/login')) {
      return;
    }
    this.clearSession();
    this.router.navigate(['/login'], { queryParams: { sesion: 'expirada' } });
  }

  getToken(): string | null {
    return this.readStorage(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isExpired(token);
  }

  private clearSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USERNAME_KEY);
    }
    this.username.set(null);
  }

  /** `exp` del JWT en segundos epoch, o null si el token no se puede leer. */
  private expiresAt(token: string): number | null {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    try {
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const exp: unknown = JSON.parse(json).exp;
      return typeof exp === 'number' ? exp : null;
    } catch {
      return null;
    }
  }

  private isExpired(token: string): boolean {
    const exp = this.expiresAt(token);
    // Un token ilegible no se descarta aquí: la última palabra la tiene el backend,
    // que responderá 401 y el interceptor cerrará la sesión.
    return exp !== null && exp * 1000 <= Date.now();
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
