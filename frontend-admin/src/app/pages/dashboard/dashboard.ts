import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, SiteSettings } from '../../core/admin-api.service';

type BrandColors = Pick<SiteSettings, 'primaryColor' | 'secondaryColor' | 'tertiaryColor'>;
type ColorKey = keyof BrandColors;

const BRAND_COLORS: BrandColors = {
  primaryColor: '#f89e1b',
  secondaryColor: '#000000',
  tertiaryColor: '#ffffff',
};
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly activeEvents = signal(0);
  readonly unreadPrayerRequests = signal(0);
  readonly liveBannerVisible = signal(true);

  readonly colorFields: { key: ColorKey; label: string; hint: string }[] = [
    { key: 'primaryColor', label: 'Primario', hint: 'Botones, franja en vivo y acentos' },
    { key: 'secondaryColor', label: 'Secundario', hint: 'Textos y secciones oscuras' },
    { key: 'tertiaryColor', label: 'Terciario', hint: 'Fondo de la página' },
  ];
  readonly colors = signal<BrandColors>({ ...BRAND_COLORS });
  readonly colorsStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly colorsError = signal<string | null>(null);

  readonly autoContent = [
    { name: 'Devocional diario', frequency: 'Automático, cada mañana' },
    { name: 'Prédicas', frequency: 'Automático desde YouTube' },
    { name: 'Eventos', frequency: 'Cuando haya algo nuevo' },
    { name: 'Peticiones de oración', frequency: 'Revisar a diario' },
    { name: 'Horarios y cuentas', frequency: 'Rara vez' },
  ];

  ngOnInit(): void {
    this.api.listEvents().subscribe((events) => this.activeEvents.set(events.filter((e) => e.published).length));
    this.api.listPrayerRequests().subscribe((items) => this.unreadPrayerRequests.set(items.filter((i) => !i.read).length));
    this.api.getSiteSettings().subscribe((settings) => {
      this.liveBannerVisible.set(settings.liveBannerVisible);
      this.colors.set({
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        tertiaryColor: settings.tertiaryColor,
      });
    });
  }

  setColor(key: ColorKey, value: string): void {
    this.colors.update((colors) => ({ ...colors, [key]: value.trim() }));
    this.colorsStatus.set('idle');
    this.colorsError.set(null);
  }

  isValid(value: string): boolean {
    return HEX_COLOR.test(value);
  }

  saveColors(colors: BrandColors = this.colors()): void {
    if (!Object.values(colors).every((value) => this.isValid(value))) {
      this.colorsStatus.set('error');
      this.colorsError.set('Cada color debe tener el formato #RRGGBB, por ejemplo #f89e1b.');
      return;
    }
    this.colorsStatus.set('saving');
    this.api.updateSiteSettings(colors).subscribe({
      next: (saved) => {
        this.colors.set({
          primaryColor: saved.primaryColor,
          secondaryColor: saved.secondaryColor,
          tertiaryColor: saved.tertiaryColor,
        });
        this.colorsStatus.set('saved');
      },
      error: (err: HttpErrorResponse) => {
        this.colorsStatus.set('error');
        this.colorsError.set(err.error?.error ?? 'No se pudieron guardar los colores.');
      },
    });
  }

  resetColors(): void {
    this.saveColors({ ...BRAND_COLORS });
  }
}
