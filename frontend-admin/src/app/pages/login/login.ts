import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Viene prellenado cuando se llega desde una invitación o un restablecimiento de clave. */
  readonly username = signal(this.route.snapshot.queryParamMap.get('usuario') ?? '');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  /** Aviso cuando el interceptor cerró la sesión por un 401, para no dejarlo sin explicación. */
  readonly notice = signal<string | null>(
    this.route.snapshot.queryParamMap.get('sesion') === 'expirada'
      ? 'Tu sesión expiró. Ingresa de nuevo.'
      : null,
  );

  submit(): void {
    if (!this.username() || !this.password()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.username(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/panel']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Usuario o clave inválidos.');
      },
    });
  }
}
