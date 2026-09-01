import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublishStateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/publish`;

  readonly pendingCount = signal(0);
  readonly publishing = signal(false);

  refresh(): void {
    this.http.get<{ pendingCount: number }>(`${this.baseUrl}/pending`).subscribe({
      next: (res) => this.pendingCount.set(res.pendingCount),
      error: () => {},
    });
  }

  publish(onDone?: () => void): void {
    this.publishing.set(true);
    this.http.post<{ pendingCount: number }>(this.baseUrl, {}).subscribe({
      next: (res) => {
        this.publishing.set(false);
        this.pendingCount.set(res.pendingCount);
        onDone?.();
      },
      error: () => this.publishing.set(false),
    });
  }
}
