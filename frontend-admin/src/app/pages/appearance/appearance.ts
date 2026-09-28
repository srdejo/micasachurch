import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService, ThemeColorField, ThemePalette } from '../../core/admin-api.service';
import { BrandThemeService } from '../../core/brand-theme.service';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const THEME_NOTES: Record<string, string> = {
  Naranja: 'Color primario de la marca',
  Coral: 'Cálido, para temporadas especiales',
  Celeste: 'Fresco, del material de ofrendas',
};

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appearance.html',
})
export class Appearance implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly brandTheme = inject(BrandThemeService);

  readonly fields: { key: ThemeColorField; label: string; hint: string }[] = [
    { key: 'accentColor', label: 'Acento', hint: 'botones y franjas' },
    { key: 'deepColor', label: 'Profundo', hint: 'textos y enlaces' },
    { key: 'softColor', label: 'Suave', hint: 'fondos' },
  ];

  readonly themes = signal<ThemePalette[]>([]);
  /** Lo que el admin está escribiendo; solo se guarda cuando es un #RRGGBB válido. */
  readonly drafts = signal<Record<string, Record<ThemeColorField, string>>>({});
  readonly activeTheme = signal<string | null>(null);
  readonly status = signal<{ theme: string; kind: 'saved' | 'error'; message: string } | null>(null);

  ngOnInit(): void {
    this.api.listThemes().subscribe((themes) => {
      this.themes.set(themes);
      this.drafts.set(Object.fromEntries(themes.map((t) => [t.name, this.colorsOf(t)])));
    });
    this.api.getSiteSettings().subscribe((settings) => this.activeTheme.set(settings.activeTheme));
  }

  note(theme: ThemePalette): string {
    return THEME_NOTES[theme.name] ?? '';
  }

  draft(theme: ThemePalette, field: ThemeColorField): string {
    return this.drafts()[theme.name]?.[field] ?? theme[field];
  }

  isValid(value: string): boolean {
    return HEX_COLOR.test(value);
  }

  /** Muestra de color: si el borrador no es válido todavía, se ve el color guardado. */
  swatch(theme: ThemePalette, field: ThemeColorField): string {
    const value = this.draft(theme, field);
    return this.isValid(value) ? value : theme[field];
  }

  edit(theme: ThemePalette, field: ThemeColorField, value: string): void {
    const trimmed = value.trim();
    this.drafts.update((d) => ({ ...d, [theme.name]: { ...d[theme.name], [field]: trimmed } }));
    if (!this.isValid(trimmed)) {
      this.status.set({ theme: theme.name, kind: 'error', message: 'Cada color debe tener el formato #RRGGBB, por ejemplo #fba504.' });
      return;
    }
    this.api.updateTheme(theme.name, { [field]: trimmed }).subscribe({
      next: (saved) => {
        this.themes.update((list) => list.map((t) => (t.name === saved.name ? saved : t)));
        this.status.set({ theme: theme.name, kind: 'saved', message: 'Guardado ✓' });
        if (saved.name === this.activeTheme()) {
          this.brandTheme.apply(saved);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.drafts.update((d) => ({ ...d, [theme.name]: this.colorsOf(theme) }));
        this.status.set({ theme: theme.name, kind: 'error', message: err.error?.error ?? 'No se pudo guardar el color.' });
      },
    });
  }

  use(theme: ThemePalette): void {
    this.api.updateSiteSettings({ activeTheme: theme.name }).subscribe({
      next: (settings) => {
        this.activeTheme.set(settings.activeTheme);
        this.brandTheme.apply(settings);
        this.status.set({ theme: theme.name, kind: 'saved', message: 'Ahora es el tema del sitio ✓' });
      },
      error: (err: HttpErrorResponse) =>
        this.status.set({ theme: theme.name, kind: 'error', message: err.error?.error ?? 'No se pudo cambiar el tema.' }),
    });
  }

  private colorsOf(theme: ThemePalette): Record<ThemeColorField, string> {
    return { accentColor: theme.accentColor, deepColor: theme.deepColor, softColor: theme.softColor };
  }
}
