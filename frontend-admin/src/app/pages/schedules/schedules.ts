import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, ServiceScheduleItem, SiteSettings } from '../../core/admin-api.service';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules.html',
})
export class Schedules implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly schedules = signal<ServiceScheduleItem[]>([]);
  readonly siteSettings = signal<SiteSettings>({ liveBannerVisible: true });

  ngOnInit(): void {
    this.api.listServices().subscribe((data) => this.schedules.set(data));
    this.api.getSiteSettings().subscribe((data) => this.siteSettings.set(data));
  }

  save(schedule: ServiceScheduleItem): void {
    this.api.updateService(schedule.id, { time: schedule.time, note: schedule.note }).subscribe();
  }

  toggleBanner(): void {
    const next = { liveBannerVisible: !this.siteSettings().liveBannerVisible };
    this.api.updateSiteSettings(next).subscribe(() => this.siteSettings.set(next));
  }
}
