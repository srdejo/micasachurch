import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

  /**
   * Las atendidas nunca se borran, así que la lista sólo crece. Por defecto se muestran las que
   * faltan por atender, que es para lo que el equipo de oración entra aquí.
   */
  readonly showAll = signal(false);
  readonly pendingCount = computed(() => this.requests().filter((r) => !r.read).length);
  readonly visibleRequests = computed(() =>
    this.showAll() ? this.requests() : this.requests().filter((r) => !r.read),
  );

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
    const digits = phone.replace(/\D/g, '');
    // wa.me exige indicativo de pais. La gente escribe su celular como lo marca en Colombia
    // ("3001234567"), y sin el 57 el enlace abre WhatsApp con un numero invalido.
    const withCountryCode = digits.length === 10 && digits.startsWith('3') ? `57${digits}` : digits;
    return `https://wa.me/${withCountryCode}`;
  }
}
