import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly api = inject(AdminApiService);

  readonly username = signal('');
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly logoFailed = signal(false);

  logoUrl(): string {
    return this.api.imageUrl('logo');
  }

  submit(): void {
    if (!this.username()) {
      return;
    }
    this.loading.set(true);
    this.api.forgotPassword({ username: this.username() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
    });
  }
}
