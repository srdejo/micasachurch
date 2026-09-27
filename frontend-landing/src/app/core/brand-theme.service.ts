import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { ChurchApiService, SiteSettings } from './church-api.service';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Aplica los colores que el admin guarda en los ajustes del sitio. Solo corre en el navegador:
 * el HTML prerenderizado lleva los colores por defecto de styles.css.
 */
@Injectable({ providedIn: 'root' })
export class BrandThemeService {
  private readonly api = inject(ChurchApiService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  load(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.api.getSiteSettings().subscribe({ next: (settings) => this.apply(settings), error: () => undefined });
  }

  apply(settings: SiteSettings): void {
    const root = this.document.documentElement;
    const colors: [string, string | undefined][] = [
      ['--brand-primary', settings.primaryColor],
      ['--brand-secondary', settings.secondaryColor],
      ['--brand-tertiary', settings.tertiaryColor],
    ];
    for (const [variable, value] of colors) {
      if (value && HEX_COLOR.test(value)) {
        root.style.setProperty(variable, value);
      }
    }
  }
}
