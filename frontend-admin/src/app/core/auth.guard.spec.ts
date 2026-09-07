import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

function correrGuard(autenticado: boolean) {
  const router = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: { isAuthenticated: () => autenticado } },
      { provide: Router, useValue: router },
    ],
  });

  const resultado = TestBed.runInInjectionContext(() =>
    authGuard(null as never, null as never),
  );

  return { resultado, router };
}

describe('authGuard', () => {
  it('deja pasar con sesión válida', () => {
    const { resultado, router } = correrGuard(true);

    expect(resultado).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('manda al login sin sesión', () => {
    const { resultado, router } = correrGuard(false);

    expect(resultado).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
