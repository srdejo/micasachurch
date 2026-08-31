import { CommonModule } from '@angular/common';
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

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.listPrayerRequests().subscribe((data) => this.requests.set(data));
  }

  markRead(id: string): void {
    this.api.markPrayerRequestRead(id).subscribe(() => this.reload());
  }

  whatsappLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }
}
