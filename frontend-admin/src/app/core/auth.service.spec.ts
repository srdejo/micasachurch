import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'micasachurch_admin_token';
const USERNAME_KEY = 'micasachurch_admin_username';

/** Arma un JWT de mentira con el `exp` pedido. Sólo importa el payload. */
function tokenCon(expEnSegundos: number | null): string {
  const payload = expEnSegundos === null ? {} : { exp: expEnSegundos };
  const base64 = btoa(JSON.stringify(payload));
  return `cabecera.${base64}.firma`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn>; url: string };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn(), url: '/dashboard' };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('guarda token y usuario cuando el login responde', () => {
    let respondio = false;

    service.login('admin', 'secreta').subscribe(() => (respondio = true));

    const req = http.expectOne(`${environment.apiUrl}/admin/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'secreta' });

    req.flush({
      success: true,
      data: { token: tokenCon(Date.now() / 1000 + 3600), username: 'admin' },
    });

    expect(respondio).toBe(true);
    expect(localStorage.getItem(USERNAME_KEY)).toBe('admin');
    expect(service.username()).toBe('admin');
    expect(service.isAuthenticated()).toBe(true);
    http.verify();
  });

  it('no está autenticado sin token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('un token vencido no autentica', () => {
    localStorage.setItem(TOKEN_KEY, tokenCon(Date.now() / 1000 - 60));
    expect(service.isAuthenticated()).toBe(false);
  });

  it('un token ilegible se deja pasar: la última palabra la tiene el backend', () => {
    localStorage.setItem(TOKEN_KEY, 'esto-no-es-un-jwt');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout limpia la sesión y manda al login', () => {
    localStorage.setItem(TOKEN_KEY, tokenCon(Date.now() / 1000 + 3600));
    localStorage.setItem(USERNAME_KEY, 'admin');

    service.logout();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
    expect(service.username()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('sessionExpired avisa en el login por qué se cerró la sesión', () => {
    localStorage.setItem(TOKEN_KEY, tokenCon(Date.now() / 1000 - 60));

    service.sessionExpired();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { sesion: 'expirada' },
    });
  });

  it('sessionExpired no redirige si ya estamos en el login sin token', () => {
    router.url = '/login';

    service.sessionExpired();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
