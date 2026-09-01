import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';
import { PublishStateService } from '../../core/publish-state.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell implements OnInit {
  readonly auth = inject(AuthService);
  readonly publishState = inject(PublishStateService);
  private readonly api = inject(AdminApiService);

  readonly logoFailed = signal(false);

  ngOnInit(): void {
    this.publishState.refresh();
  }

  logoUrl(): string {
    return this.api.imageUrl('logo');
  }

  publishChanges(): void {
    this.publishState.publish();
  }

  readonly navItems = [
    { path: 'panel', label: 'Panel' },
    { path: 'eventos', label: 'Eventos' },
    { path: 'oracion', label: 'Peticiones de oración' },
    { path: 'redes', label: 'Redes' },
    { path: 'horarios', label: 'Horarios y en vivo' },
    { path: 'enlaces', label: 'Enlaces' },
    { path: 'contenido', label: 'Contenido' },
    { path: 'imagenes', label: 'Imágenes' },
    { path: 'cuenta', label: 'Cuenta' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
