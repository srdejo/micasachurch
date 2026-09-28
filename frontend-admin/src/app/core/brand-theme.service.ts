import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { AdminApiService } from './admin-api.service';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export interface ThemeColors {
  accentColor?: string;
  deepColor?: string;
  softColor?: string;
}

/** El panel se ve con el mismo tema que el sitio: así el admin ve el color que eligió. */
@Injectable({ providedIn: 'root' })
export class BrandThemeService {
  private readonly api = inject(AdminApiService);
  private readonly document = inject(DOCUMENT);

  load(): void {
    this.api.getSiteSettings().subscribe({ next: (settings) => this.apply(settings), error: () => undefined });
  }

  apply(colors: ThemeColors): void {
    const root = this.document.documentElement;
    const entries: [string, string | undefined][] = [
      ['--accent', colors.accentColor],
      ['--accent-deep', colors.deepColor],
      ['--accent-soft', colors.softColor],
    ];
    for (const [variable, value] of entries) {
      if (value && HEX_COLOR.test(value)) {
        root.style.setProperty(variable, value);
      }
    }
  }
}
