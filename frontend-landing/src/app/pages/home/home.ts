import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ChurchApiService,
  EventItem,
  LinkEntryItem,
  NetworkItem,
  ServiceScheduleItem,
  SiteSettings,
} from '../../core/church-api.service';
import { DevotionalApiService, DevotionalEntry } from '../../core/devotional-api.service';
import { DevotionalArticle } from '../../shared/devotional-article/devotional-article';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DevotionalArticle],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly api = inject(ChurchApiService);
  private readonly devotionalApi = inject(DevotionalApiService);

  readonly events = signal<EventItem[]>([]);
  readonly services = signal<ServiceScheduleItem[]>([]);
  readonly networks = signal<NetworkItem[]>([]);
  readonly links = signal<LinkEntryItem[]>([]);
  readonly siteSettings = signal<SiteSettings>({ liveBannerVisible: true });

  readonly devotional = signal<DevotionalEntry | null>(null);
  readonly devotionalLoading = signal(true);
  readonly devotionalError = signal(false);

  readonly ministries = [
    { name: 'Niños', description: 'Un espacio seguro y divertido para que los más pequeños conozcan a Jesús.' },
    { name: 'Jóvenes', description: 'Comunidad, propósito y fe para la nueva generación.' },
    { name: 'Matrimonios', description: 'Acompañamiento para fortalecer el hogar y la pareja.' },
    { name: 'Alabanza', description: 'Un equipo dedicado a guiar la adoración cada semana.' },
  ];

  readonly prayerForm = { name: '', phone: '', message: '' };
  readonly prayerSubmitted = signal(false);
  readonly prayerSubmitting = signal(false);
  readonly prayerError = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getEvents().subscribe({ next: (data) => this.events.set(data), error: () => this.events.set([]) });
    this.api.getServices().subscribe({ next: (data) => this.services.set(data), error: () => this.services.set([]) });
    this.api.getNetworks().subscribe({ next: (data) => this.networks.set(data), error: () => this.networks.set([]) });
    this.api.getLinks().subscribe({ next: (data) => this.links.set(data), error: () => this.links.set([]) });
    this.api.getSiteSettings().subscribe({
      next: (data) => this.siteSettings.set(data),
      error: () => this.siteSettings.set({ liveBannerVisible: true }),
    });
    this.loadDevotional();
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

  submitPrayerRequest(): void {
    if (!this.prayerForm.message.trim()) {
      return;
    }
    this.prayerSubmitting.set(true);
    this.prayerError.set(null);
    this.api
      .submitPrayerRequest({
        name: this.prayerForm.name || undefined,
        phone: this.prayerForm.phone || undefined,
        message: this.prayerForm.message,
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
