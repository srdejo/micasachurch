import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  // Las rutas de /admin/auth/ (login, olvidé mi clave, reset) son públicas: un 401 ahí
  // significa "credenciales inválidas", no "sesión vencida".
  const isPublicAuthCall = req.url.includes('/admin/auth/');

  if (token && req.url.includes('/admin/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublicAuthCall) {
        auth.sessionExpired();
      }
      return throwError(() => error);
    }),
  );
};
