import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChurchApiService,
  EventItem,
  LinkEntryItem,
  MinistryItem,
  NetworkItem,
  ServiceScheduleItem,
  SiteContentItem,
  SiteSettings,
} from '../../core/church-api.service';
import { DevotionalApiService, DevotionalEntry } from '../../core/devotional-api.service';

const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/micasachurchocana';
const CHURCH_MAPS_URL =
  'https://www.google.com/maps/place/Cl.+7A+%23+37-8,+Oca%C3%B1a,+Norte+de+Santander/@8.2618302,-73.3598166,21z';
// Las mismas reglas que valida el backend en PrayerRequestService.
const NAME_PATTERN = /^[\p{L} ]{1,80}$/u;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

interface PrayerErrors {
  name?: string;
  phone?: string;
  message?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly api = inject(ChurchApiService);
  private readonly devotionalApi = inject(DevotionalApiService);

  readonly events = signal<EventItem[]>([]);
  readonly services = signal<ServiceScheduleItem[]>([]);
  /**
   * Horarios del hero, agrupados por día. El backend los devuelve ordenados por `displayOrder`
   * (migración V8); aquí sólo se juntan las varias horas de un mismo día, como en el pie de página.
   * Antes esto era `services().slice(0, 3)` y el "Domingo 8:30 a.m." desaparecía del hero.
   */
  readonly heroSchedule = computed(() => {
    const byDay = new Map<string, { day: string; times: string[] }>();
    for (const service of this.services()) {
      const key = service.day.trim().toLowerCase();
      const entry = byDay.get(key) ?? { day: service.day, times: [] };
      entry.times.push(service.time);
      byDay.set(key, entry);
    }
    return [...byDay.values()].map((e) => ({
      day: e.day,
      time: e.times.length > 1 ? `${e.times.slice(0, -1).join(', ')} y ${e.times.at(-1)}` : e.times[0],
    }));
  });

  readonly networks = signal<NetworkItem[]>([]);
  readonly links = signal<LinkEntryItem[]>([]);
  readonly siteSettings = signal<SiteSettings>({ liveBannerVisible: true });

  readonly devotional = signal<DevotionalEntry | null>(null);
  readonly devotionalLoading = signal(true);
  readonly devotionalError = signal(false);

  readonly ministries = signal<MinistryItem[]>([]);
  readonly siteContent = signal<SiteContentItem[]>([]);

  readonly heroImageFailed = signal(false);
  readonly quienesSomosImageFailed = signal(false);

  readonly prayerForm = { name: '', phone: '', message: '' };
  readonly prayerErrors = signal<PrayerErrors>({});
  readonly prayerSubmitted = signal(false);
  readonly prayerSubmitting = signal(false);
  readonly prayerError = signal<string | null>(null);

  readonly mobileMenuOpen = signal(false);
  readonly prettyDate = this.formatPrettyDate(new Date());
  readonly churchMapsUrl = CHURCH_MAPS_URL;

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  facebookUrl(): string {
    return this.linkValue('facebook') || DEFAULT_FACEBOOK_URL;
  }

  private formatPrettyDate(date: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }

  ngOnInit(): void {
    this.api.getEvents().subscribe({ next: (data) => this.events.set(data), error: () => this.events.set([]) });
    this.api.getServices().subscribe({ next: (data) => this.services.set(data), error: () => this.services.set([]) });
    this.api.getNetworks().subscribe({ next: (data) => this.networks.set(data), error: () => this.networks.set([]) });
    this.api.getLinks().subscribe({ next: (data) => this.links.set(data), error: () => this.links.set([]) });
    this.api.getSiteSettings().subscribe({
      next: (data) => this.siteSettings.set(data),
      error: () => this.siteSettings.set({ liveBannerVisible: true }),
    });
    this.api.getMinistries().subscribe({ next: (data) => this.ministries.set(data), error: () => this.ministries.set([]) });
    this.api.getSiteContent().subscribe({ next: (data) => this.siteContent.set(data), error: () => this.siteContent.set([]) });
    this.loadDevotional();
  }

  contentValue(key: string, fallback: string): string {
    return this.siteContent().find((c) => c.key === key)?.value ?? fallback;
  }

  imageUrl(key: string): string {
    return this.api.imageUrl(key);
  }

  private loadDevotional(): void {
    this.devotionalLoading.set(true);
    this.devotionalError.set(false);
    this.devotionalApi.getByDate(new Date()).subscribe({
      next: (entry) => {
        this.devotional.set(entry);
        this.devotionalLoading.set(false);
        if (!entry) {
          this.devotionalError.set(true);
        }
      },
      error: () => {
        this.devotionalError.set(true);
        this.devotionalLoading.set(false);
      },
    });
  }

  retryDevotional(): void {
    this.loadDevotional();
  }

  linkValue(key: string): string {
    return this.links().find((l) => l.key === key)?.value ?? '';
  }

  clearPrayerError(field: keyof PrayerErrors): void {
    if (this.prayerErrors()[field]) {
      this.prayerErrors.update((errors) => ({ ...errors, [field]: undefined }));
    }
  }

  private validatePrayerForm(): PrayerErrors {
    const errors: PrayerErrors = {};
    const name = this.prayerForm.name.trim();
    const phone = this.prayerForm.phone.trim();
    if (!this.prayerForm.message.trim()) {
      errors.message = 'Escribe tu petición antes de enviarla.';
    }
    if (name && !NAME_PATTERN.test(name)) {
      errors.name = 'El nombre solo puede tener letras y espacios.';
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      errors.phone = 'Escribe solo números (7 a 15 dígitos, puedes empezar con +).';
    }
    return errors;
  }

  submitPrayerRequest(): void {
    const errors = this.validatePrayerForm();
    this.prayerErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    this.prayerSubmitting.set(true);
    this.prayerError.set(null);
    this.api
      .submitPrayerRequest({
        name: this.prayerForm.name.trim() || undefined,
        phone: this.prayerForm.phone.trim() || undefined,
        message: this.prayerForm.message.trim(),
      })
      .subscribe({
        next: () => {
          this.prayerSubmitted.set(true);
          this.prayerSubmitting.set(false);
        },
        error: () => {
          this.prayerError.set('No pudimos enviar tu petición. Intenta de nuevo en un momento.');
          this.prayerSubmitting.set(false);
        },
      });
  }
}
