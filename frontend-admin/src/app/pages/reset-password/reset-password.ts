import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly token = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);
  readonly logoFailed = signal(false);

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token') ?? '');
  }

  logoUrl(): string {
    return this.api.imageUrl('logo');
  }

  submit(): void {
    if (!this.token()) {
      this.error.set('El enlace no es válido. Solicita uno nuevo.');
      return;
    }
    if (this.newPassword().length < 8) {
      this.error.set('La clave debe tener al menos 8 caracteres.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('Las claves no coinciden.');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    this.api.resetPassword({ token: this.token(), newPassword: this.newPassword() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.error ?? 'No se pudo restablecer la clave.');
      },
    });
  }
}
