import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminApiService, AdminUserItem } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);

  readonly adminUsers = signal<AdminUserItem[]>([]);
  /** Para no ofrecer "Eliminar" sobre uno mismo: borrarse deja la sesion viva pero sin usuario. */
  readonly currentUsername = this.auth.username;

  readonly showPasswords = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);
  readonly changingPassword = signal(false);

  readonly email = signal('');
  readonly emailError = signal<string | null>(null);
  readonly emailSuccess = signal(false);
  readonly savingEmail = signal(false);

  readonly newUsername = signal('');
  readonly newUserEmail = signal('');
  readonly createUserError = signal<string | null>(null);
  readonly creatingUser = signal(false);
  readonly userInvited = signal(false);
  readonly pendingDelete = signal<AdminUserItem | null>(null);
  readonly deleting = signal(false);
  /** Antes este error salia en un alert() del navegador. */
  readonly deleteError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAdminUsers();
  }

  private loadAdminUsers(): void {
    this.api.listAdminUsers().subscribe((data) => {
      this.adminUsers.set(data);
      const self = data.find((u) => u.username === this.auth.username());
      if (self?.email && !this.email()) {
        this.email.set(self.email);
      }
    });
  }

  clearPasswordError(): void {
    this.passwordError.set(null);
  }

  /** Misma validación que al restablecer la clave: compara los valores reales de los campos al enviar. */
  changePassword(form: NgForm): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    const currentPassword: string = form.value.currentPassword ?? '';
    const newPassword: string = form.value.newPassword ?? '';
    const confirmPassword: string = form.value.confirmPassword ?? '';
    if (!currentPassword) {
      this.passwordError.set('Escribe tu clave actual.');
      return;
    }
    if (newPassword.length < 8) {
      this.passwordError.set('La clave nueva debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordError.set('Las claves no coinciden.');
      return;
    }
    this.changingPassword.set(true);
    this.api
      .changePassword({ currentPassword, newPassword })
      .subscribe({
        next: () => {
          this.changingPassword.set(false);
          form.resetForm();
          this.passwordSuccess.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.changingPassword.set(false);
          this.passwordError.set(err.error?.error ?? 'No se pudo cambiar la clave.');
        },
      });
  }

  saveEmail(): void {
    this.emailError.set(null);
    this.emailSuccess.set(false);
    this.savingEmail.set(true);
    this.api.updateOwnEmail({ email: this.email() }).subscribe({
      next: () => {
        this.savingEmail.set(false);
        this.emailSuccess.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.savingEmail.set(false);
        this.emailError.set(err.error?.error ?? 'No se pudo guardar el correo.');
      },
    });
  }

  createAdminUser(): void {
    this.createUserError.set(null);
    this.userInvited.set(false);
    this.creatingUser.set(true);
    this.api
      .createAdminUser({ username: this.newUsername(), email: this.newUserEmail() })
      .subscribe({
        next: () => {
          this.creatingUser.set(false);
          this.userInvited.set(true);
          this.newUsername.set('');
          this.newUserEmail.set('');
          this.loadAdminUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.creatingUser.set(false);
          this.createUserError.set(err.error?.error ?? 'No se pudo invitar al usuario.');
        },
      });
  }

  askDeleteAdminUser(user: AdminUserItem): void {
    this.deleteError.set(null);
    this.pendingDelete.set(user);
  }

  confirmDeleteAdminUser(): void {
    const user = this.pendingDelete();
    if (!user) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteAdminUser(user.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.loadAdminUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.deleteError.set(err.error?.error ?? 'No se pudo eliminar el usuario.');
      },
    });
  }
}
