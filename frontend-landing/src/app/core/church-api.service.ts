import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  detail: string;
  published: boolean;
  displayOrder: number;
}

export interface ServiceScheduleItem {
  id: string;
  day: string;
  time: string;
  note: string;
  streamed: boolean;
  displayOrder: number;
  durationMinutes: number;
}

export interface NetworkItem {
  id: string;
  key: string;
  name: string;
  description: string;
  leadContact: string | null;
}

export interface LinkEntryItem {
  id: string;
  key: string;
  label: string;
  value: string;
}

export interface SiteSettings {
  liveBannerVisible: boolean;
  activeTheme?: string;
  accentColor?: string;
  deepColor?: string;
  softColor?: string;
}

export interface HeroBannerItem {
  id: string;
  kicker: string | null;
  title: string;
  text: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  /** Solo viene cuando la imagen existe de verdad en el servidor. */
  imageKey: string | null;
  imageUpdatedAt: string | null;
  active: boolean;
  displayOrder: number;
}

export interface LiveEventItem {
  id: string;
  title: string;
  /** YYYY-MM-DD, fecha en Colombia. */
  date: string;
  /** HH:mm, hora de Colombia. */
  startTime: string;
  durationMinutes: number;
  url: string;
  active: boolean;
}

export interface PrayerRequestSubmission {
  name?: string;
  phone?: string;
  message: string;
}

export interface MinistryItem {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
}

export interface SiteContentItem {
  id: string;
  key: string;
  label: string;
  section: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class ChurchApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.baseUrl}/events`);
  }

  getServices(): Observable<ServiceScheduleItem[]> {
    return this.http.get<ServiceScheduleItem[]>(`${this.baseUrl}/services`);
  }

  getNetworks(): Observable<NetworkItem[]> {
    return this.http.get<NetworkItem[]>(`${this.baseUrl}/networks`);
  }

  getLinks(): Observable<LinkEntryItem[]> {
    return this.http.get<LinkEntryItem[]>(`${this.baseUrl}/links`);
  }

  getSiteSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.baseUrl}/site-settings`);
  }

  getBanners(): Observable<HeroBannerItem[]> {
    return this.http.get<HeroBannerItem[]>(`${this.baseUrl}/banners`);
  }

  getLiveEvents(): Observable<LiveEventItem[]> {
    return this.http.get<LiveEventItem[]>(`${this.baseUrl}/live-events`);
  }

  submitPrayerRequest(payload: PrayerRequestSubmission): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/prayer-requests`, payload);
  }

  getMinistries(): Observable<MinistryItem[]> {
    return this.http.get<MinistryItem[]>(`${this.baseUrl}/ministries`);
  }

  getSiteContent(): Observable<SiteContentItem[]> {
    return this.http.get<SiteContentItem[]>(`${this.baseUrl}/site-content`);
  }

  imageUrl(key: string): string {
    return `${this.baseUrl}/images/${key}`;
  }

  /** La versión en la URL evita que el navegador muestre la foto anterior tras reemplazarla (se cachea 1 h). */
  bannerImageUrl(banner: HeroBannerItem): string | null {
    if (!banner.imageKey) {
      return null;
    }
    const version = banner.imageUpdatedAt ? `?v=${encodeURIComponent(banner.imageUpdatedAt)}` : '';
    return `${this.imageUrl(banner.imageKey)}${version}`;
  }
}
