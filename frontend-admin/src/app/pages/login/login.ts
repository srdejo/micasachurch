import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly logoFailed = signal(false);

  logoUrl(): string {
    return this.api.imageUrl('logo');
  }

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
