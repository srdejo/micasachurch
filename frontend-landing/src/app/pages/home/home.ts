import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChurchApiService,
  EventItem,
  HeroBannerItem,
  LinkEntryItem,
  LiveEventItem,
  MinistryItem,
  NetworkItem,
  ServiceScheduleItem,
  SiteContentItem,
  SiteSettings,
} from '../../core/church-api.service';
import { AnalyticsService } from '../../core/analytics.service';
import { DevotionalApiService, DevotionalEntry } from '../../core/devotional-api.service';
import { ChurchClock, LiveStatus, churchClock, computeLiveStatus } from '../../core/live-status';
import { HeroCarousel } from '../../shared/hero-carousel/hero-carousel';
import { AudioPlayer } from '../../shared/audio-player/audio-player';
import { ScheduleModal } from '../../shared/schedule-modal/schedule-modal';
import { TrackClick } from '../../shared/track-click/track-click';

const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/micasachurchocana';
const DEFAULT_WHATSAPP_URL = 'https://wa.me/573045332589';
const CHURCH_MAPS_URL =
  'https://www.google.com/maps/place/Cl.+7A+%23+37-8,+Oca%C3%B1a,+Norte+de+Santander/@8.2618302,-73.3598166,21z';
const LIVE_REFRESH_MS = 30_000;
const EVERY_DAY = 'todos los días';
// Las mismas reglas que valida el backend en PrayerRequestService.
const NAME_PATTERN = /^[\p{L} ]{1,80}$/u;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

interface PrayerErrors {
  name?: string;
  phone?: string;
  message?: string;
}

interface DaySchedule {
  day: string;
  times: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeroCarousel, ScheduleModal, AudioPlayer, TrackClick],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly api = inject(ChurchApiService);
  private readonly devotionalApi = inject(DevotionalApiService);
  private readonly analytics = inject(AnalyticsService);

  readonly events = signal<EventItem[]>([]);
  readonly services = signal<ServiceScheduleItem[]>([]);
  readonly networks = signal<NetworkItem[]>([]);
  readonly links = signal<LinkEntryItem[]>([]);
  readonly siteSettings = signal<SiteSettings>({ liveBannerVisible: true });
  readonly banners = signal<HeroBannerItem[]>([]);
  readonly liveEvents = signal<LiveEventItem[]>([]);
  readonly ministries = signal<MinistryItem[]>([]);
  readonly siteContent = signal<SiteContentItem[]>([]);

  readonly devotional = signal<DevotionalEntry | null>(null);
  readonly devotionalLoading = signal(true);
  readonly devotionalError = signal(false);

  readonly quienesSomosImageFailed = signal(false);

  readonly prayerForm = { name: '', phone: '', message: '' };
  readonly prayerErrors = signal<PrayerErrors>({});
  readonly prayerSubmitted = signal(false);
  readonly prayerSubmitting = signal(false);
  readonly prayerError = signal<string | null>(null);

  readonly mobileMenuOpen = signal(false);
  readonly scheduleOpen = signal(false);
  readonly prettyDate = this.formatPrettyDate(new Date());
  readonly churchMapsUrl = CHURCH_MAPS_URL;

  /** Null durante el render del servidor: el estado en vivo depende de la hora y solo se calcula en el navegador. */
  private readonly clock = signal<ChurchClock | null>(null);

  readonly liveStatus = computed<LiveStatus | null>(() => {
    const clock = this.clock();
    return clock ? computeLiveStatus(this.services(), this.liveEvents(), clock, this.facebookUrl()) : null;
  });

  /** Oculta toda señal de "en vivo" cuando el admin apaga la franja. */
  readonly live = computed(() => (this.siteSettings().liveBannerVisible ? (this.liveStatus()?.live ?? null) : null));
  readonly liveUrl = computed(() => this.live()?.url ?? this.facebookUrl());

  /** Servicios agrupados por día (el devocional diario va aparte, al final de la franja). */
  readonly weeklySchedule = computed<DaySchedule[]>(() => {
    const byDay = new Map<string, { day: string; times: string[] }>();
    for (const service of this.services()) {
      const key = service.day.trim().toLowerCase();
      if (key === EVERY_DAY) {
        continue;
      }
      const entry = byDay.get(key) ?? { day: service.day, times: [] };
      entry.times.push(service.time);
      byDay.set(key, entry);
    }
    return [...byDay.values()].map((e) => ({
      day: e.day,
      times: e.times.length > 1 ? `${e.times.slice(0, -1).join(', ')} y ${e.times.at(-1)}` : e.times[0],
    }));
  });

  readonly dailyDevotionalTime = computed(
    () => this.services().find((s) => s.day.trim().toLowerCase() === EVERY_DAY)?.time ?? '7:00 a.m.',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.clock.set(churchClock(new Date()));
      const timer = setInterval(() => this.clock.set(churchClock(new Date())), LIVE_REFRESH_MS);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
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
    this.api.getBanners().subscribe({ next: (data) => this.banners.set(data), error: () => this.banners.set([]) });
    this.api.getLiveEvents().subscribe({ next: (data) => this.liveEvents.set(data), error: () => this.liveEvents.set([]) });
    this.api.getMinistries().subscribe({ next: (data) => this.ministries.set(data), error: () => this.ministries.set([]) });
    this.api.getSiteContent().subscribe({ next: (data) => this.siteContent.set(data), error: () => this.siteContent.set([]) });
    this.loadDevotional();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  openSchedule(): void {
    this.mobileMenuOpen.set(false);
    this.scheduleOpen.set(true);
  }

  facebookUrl(): string {
    return this.linkValue('facebook') || DEFAULT_FACEBOOK_URL;
  }

  whatsappUrl(): string {
    return this.linkValue('whatsapp') || DEFAULT_WHATSAPP_URL;
  }

  eventInfoUrl(event: EventItem): string {
    return `${this.whatsappUrl()}?text=${encodeURIComponent(`Quiero información de ${event.title}`)}`;
  }

  linkValue(key: string): string {
    return this.links().find((l) => l.key === key)?.value ?? '';
  }

  contentValue(key: string, fallback: string): string {
    return this.siteContent().find((c) => c.key === key)?.value ?? fallback;
  }

  imageUrl(key: string): string {
    return this.api.imageUrl(key);
  }

  private formatPrettyDate(date: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
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
          this.analytics.track('peticion_oracion');
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
