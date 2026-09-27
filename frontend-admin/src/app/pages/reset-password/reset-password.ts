import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  readonly username = signal<string | null>(null);
  readonly tokenInvalid = signal(false);
  readonly showPasswords = signal(false);
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(token);
    if (!token) {
      this.tokenInvalid.set(true);
      return;
    }
    this.api.resetTokenInfo(token).subscribe({
      next: (info) => this.username.set(info.username),
      error: () => this.tokenInvalid.set(true),
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  /**
   * Compara lo que realmente tienen los campos al enviar. Los navegadores no dejan copiar desde un
   * campo de clave, así que "copiar y pegar" la clave suele pegar otra cosa: por eso existe
   * "Mostrar claves", para que se vea qué quedó escrito.
   */
  submit(form: NgForm): void {
    const newPassword: string = form.value.newPassword ?? '';
    const confirmPassword: string = form.value.confirmPassword ?? '';
    if (newPassword.length < 8) {
      this.error.set('La clave debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.error.set('Las claves no coinciden.');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    this.api.resetPassword({ token: this.token(), newPassword }).subscribe({
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
