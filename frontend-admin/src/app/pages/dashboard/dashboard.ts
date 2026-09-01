import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../../core/admin-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly activeEvents = signal(0);
  readonly unreadPrayerRequests = signal(0);
  readonly liveBannerVisible = signal(true);

  readonly autoContent = [
    { name: 'Devocional diario', frequency: 'Automático, cada mañana' },
    { name: 'Prédicas', frequency: 'Automático desde YouTube' },
    { name: 'Eventos', frequency: 'Cuando haya algo nuevo' },
    { name: 'Peticiones de oración', frequency: 'Revisar a diario' },
    { name: 'Horarios y cuentas', frequency: 'Rara vez' },
  ];

  ngOnInit(): void {
    this.api.listEvents().subscribe((events) => this.activeEvents.set(events.filter((e) => e.published).length));
    this.api.listPrayerRequests().subscribe((items) => this.unreadPrayerRequests.set(items.filter((i) => !i.read).length));
    this.api.getSiteSettings().subscribe((settings) => this.liveBannerVisible.set(settings.liveBannerVisible));
  }
}
