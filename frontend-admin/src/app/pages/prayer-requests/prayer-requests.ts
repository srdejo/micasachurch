import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService, PrayerRequestItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-prayer-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prayer-requests.html',
})
export class PrayerRequests implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly requests = signal<PrayerRequestItem[]>([]);
  readonly markingId = signal<string | null>(null);
  readonly errorById = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.listPrayerRequests().subscribe((data) => this.requests.set(data));
  }

  markRead(id: string): void {
    this.markingId.set(id);
    this.errorById.update((m) => {
      const { [id]: _removed, ...rest } = m;
      return rest;
    });
    this.api.markPrayerRequestRead(id).subscribe({
      next: () => {
        this.markingId.set(null);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.markingId.set(null);
        this.errorById.update((m) => ({ ...m, [id]: err.error?.error ?? 'No se pudo marcar como atendida.' }));
      },
    });
  }

  whatsappLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }
}
