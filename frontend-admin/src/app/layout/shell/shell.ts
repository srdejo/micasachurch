import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell {
  readonly auth = inject(AuthService);

  readonly navItems = [
    { path: 'panel', label: 'Panel' },
    { path: 'eventos', label: 'Eventos' },
    { path: 'oracion', label: 'Peticiones de oración' },
    { path: 'redes', label: 'Redes' },
    { path: 'horarios', label: 'Horarios y en vivo' },
    { path: 'enlaces', label: 'Enlaces' },
    { path: 'cuenta', label: 'Cuenta' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
