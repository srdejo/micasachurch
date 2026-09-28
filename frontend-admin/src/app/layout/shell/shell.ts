import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BrandThemeService } from '../../core/brand-theme.service';
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
  private readonly brandTheme = inject(BrandThemeService);

  readonly navItems = [
    { path: 'panel', label: 'Panel' },
    { path: 'estadisticas', label: 'Estadísticas' },
    { path: 'eventos', label: 'Eventos' },
    { path: 'oracion', label: 'Peticiones de oración' },
    { path: 'redes', label: 'Redes' },
    { path: 'horarios', label: 'Horarios y en vivo' },
    { path: 'transmisiones', label: 'Transmisiones especiales' },
    { path: 'banner', label: 'Banner principal' },
    { path: 'imagenes', label: 'Imágenes' },
    { path: 'enlaces', label: 'Enlaces' },
    { path: 'contenido', label: 'Contenido' },
    { path: 'apariencia', label: 'Apariencia' },
    { path: 'cuenta', label: 'Cuenta' },
  ];

  ngOnInit(): void {
    this.publishState.refresh();
    this.brandTheme.load();
  }

  publishChanges(): void {
    this.publishState.publish();
  }

  logout(): void {
    this.auth.logout();
  }
}
