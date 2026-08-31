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
}

export interface PrayerRequestSubmission {
  name?: string;
  phone?: string;
  message: string;
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

  submitPrayerRequest(payload: PrayerRequestSubmission): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/prayer-requests`, payload);
  }
}
