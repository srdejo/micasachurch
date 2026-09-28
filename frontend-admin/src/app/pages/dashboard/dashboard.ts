import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../../core/admin-api.service';

const DEVOTIONAL_API = 'https://api.experience.odb.org/devotionals/v2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly http = inject(HttpClient);

  readonly activeEvents = signal(0);
  readonly unreadPrayerRequests = signal(0);
  readonly liveBannerVisible = signal(true);
  readonly devotionalStatus = signal<'loading' | 'ready' | 'offline'>('loading');

  readonly cadence = [
    { name: 'Devocional diario', frequency: 'Automático, cada mañana' },
    { name: 'Prédicas', frequency: 'Automático desde YouTube' },
    { name: 'Eventos', frequency: 'Cuando haya algo nuevo' },
    { name: 'Banner principal', frequency: 'Por temporada' },
    { name: 'Peticiones de oración', frequency: 'Revisar a diario' },
    { name: 'Horarios y cuentas', frequency: 'Rara vez' },
  ];

  ngOnInit(): void {
    this.api.listEvents().subscribe((events) => this.activeEvents.set(events.filter((e) => e.published).length));
    this.api.listPrayerRequests().subscribe((items) => this.unreadPrayerRequests.set(items.filter((i) => !i.read).length));
    this.api.getSiteSettings().subscribe((settings) => this.liveBannerVisible.set(settings.liveBannerVisible));
    this.checkDevotional();
  }

  /** Misma consulta que hace el landing: si responde con una lectura para hoy, el sitio la mostrará. */
  private checkDevotional(): void {
    const today = new Date();
    const on = [today.getMonth() + 1, today.getDate()].map((n) => String(n).padStart(2, '0')).join('-') + `-${today.getFullYear()}`;
    this.http
      .get<unknown[]>(DEVOTIONAL_API, { params: { site_id: '2', status: 'publish', country: 'CO', on } })
      .subscribe({
        next: (list) => this.devotionalStatus.set(Array.isArray(list) && list.length > 0 ? 'ready' : 'offline'),
        error: () => this.devotionalStatus.set('offline'),
      });
  }
}
