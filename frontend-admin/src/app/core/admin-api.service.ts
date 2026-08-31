import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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

export interface PrayerRequestItem {
  id: string;
  name: string | null;
  phone: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NetworkItem {
  id: string;
  key: string;
  name: string;
  description: string;
  leadContact: string | null;
}

export interface ServiceScheduleItem {
  id: string;
  day: string;
  time: string;
  note: string;
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

export interface AdminUserItem {
  id: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  listEvents() {
    return this.http.get<EventItem[]>(`${this.baseUrl}/events`);
  }

  createEvent(payload: Omit<EventItem, 'id'>) {
    return this.http.post<EventItem>(`${this.baseUrl}/events`, payload);
  }

  updateEvent(id: string, payload: Omit<EventItem, 'id'>) {
    return this.http.put<EventItem>(`${this.baseUrl}/events/${id}`, payload);
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/events/${id}`);
  }

  listPrayerRequests() {
    return this.http.get<PrayerRequestItem[]>(`${this.baseUrl}/prayer-requests`);
  }

  markPrayerRequestRead(id: string) {
    return this.http.patch<PrayerRequestItem>(`${this.baseUrl}/prayer-requests/${id}`, {});
  }

  listNetworks() {
    return this.http.get<NetworkItem[]>(`${this.baseUrl}/networks`);
  }

  updateNetwork(id: string, payload: { description: string; leadContact: string | null }) {
    return this.http.patch<NetworkItem>(`${this.baseUrl}/networks/${id}`, payload);
  }

  listServices() {
    return this.http.get<ServiceScheduleItem[]>(`${this.baseUrl}/services`);
  }

  updateService(id: string, payload: { time: string; note: string }) {
    return this.http.patch<ServiceScheduleItem>(`${this.baseUrl}/services/${id}`, payload);
  }

  listLinks() {
    return this.http.get<LinkEntryItem[]>(`${this.baseUrl}/links`);
  }

  updateLink(id: string, payload: { value: string }) {
    return this.http.patch<LinkEntryItem>(`${this.baseUrl}/links/${id}`, payload);
  }

  getSiteSettings() {
    return this.http.get<SiteSettings>(`${this.baseUrl}/site-settings`);
  }

  updateSiteSettings(payload: SiteSettings) {
    return this.http.patch<SiteSettings>(`${this.baseUrl}/site-settings`, payload);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.patch<void>(`${this.baseUrl}/auth/change-password`, payload);
  }

  listAdminUsers() {
    return this.http.get<AdminUserItem[]>(`${this.baseUrl}/admin-users`);
  }

  createAdminUser(payload: { username: string; password: string }) {
    return this.http.post<AdminUserItem>(`${this.baseUrl}/admin-users`, payload);
  }

  deleteAdminUser(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/admin-users/${id}`);
  }
}
