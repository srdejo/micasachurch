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
    { name: 'Devocional diario', frequency: 'Automático, todos los días', detail: 'Se trae en vivo desde Nuestro Pan Diario. No requiere acción del admin.' },
    { name: 'Horarios de servicio', frequency: 'Cuando tú lo edites', detail: 'Se actualiza al instante en la vista "Horarios y en vivo".' },
    { name: 'Eventos', frequency: 'Cuando tú lo edites', detail: 'Publica o retira eventos desde la vista "Eventos".' },
    { name: 'Banner en vivo', frequency: 'Cuando tú lo edites', detail: 'Actívalo o desactívalo desde "Horarios y en vivo".' },
  ];

  ngOnInit(): void {
    this.api.listEvents().subscribe((events) => this.activeEvents.set(events.filter((e) => e.published).length));
    this.api.listPrayerRequests().subscribe((items) => this.unreadPrayerRequests.set(items.filter((i) => !i.read).length));
    this.api.getSiteSettings().subscribe((settings) => this.liveBannerVisible.set(settings.liveBannerVisible));
  }
}
