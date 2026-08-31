import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminUserItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly adminUsers = signal<AdminUserItem[]>([]);

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);
  readonly changingPassword = signal(false);

  readonly newUsername = signal('');
  readonly newUserPassword = signal('');
  readonly createUserError = signal<string | null>(null);
  readonly creatingUser = signal(false);

  ngOnInit(): void {
    this.loadAdminUsers();
  }

  private loadAdminUsers(): void {
    this.api.listAdminUsers().subscribe((data) => this.adminUsers.set(data));
  }

  changePassword(): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.changingPassword.set(true);
    this.api
      .changePassword({ currentPassword: this.currentPassword(), newPassword: this.newPassword() })
      .subscribe({
        next: () => {
          this.changingPassword.set(false);
          this.passwordSuccess.set(true);
          this.currentPassword.set('');
          this.newPassword.set('');
        },
        error: (err: HttpErrorResponse) => {
          this.changingPassword.set(false);
          this.passwordError.set(err.error?.error ?? 'No se pudo cambiar la clave.');
        },
      });
  }

  createAdminUser(): void {
    this.createUserError.set(null);
    this.creatingUser.set(true);
    this.api
      .createAdminUser({ username: this.newUsername(), password: this.newUserPassword() })
      .subscribe({
        next: () => {
          this.creatingUser.set(false);
          this.newUsername.set('');
          this.newUserPassword.set('');
          this.loadAdminUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.creatingUser.set(false);
          this.createUserError.set(err.error?.error ?? 'No se pudo crear el usuario.');
        },
      });
  }

  deleteAdminUser(user: AdminUserItem): void {
    if (!confirm(`¿Eliminar el usuario "${user.username}"?`)) {
      return;
    }
    this.api.deleteAdminUser(user.id).subscribe({
      next: () => this.loadAdminUsers(),
      error: (err: HttpErrorResponse) => alert(err.error?.error ?? 'No se pudo eliminar el usuario.'),
    });
  }
}
