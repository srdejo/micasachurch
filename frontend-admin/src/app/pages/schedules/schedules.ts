import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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

  readonly savingId = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly errorById = signal<Map<string, string>>(new Map());

  ngOnInit(): void {
    this.api.listServices().subscribe((data) => this.schedules.set(data));
    this.api.getSiteSettings().subscribe((data) => this.siteSettings.set(data));
  }

  save(schedule: ServiceScheduleItem): void {
    this.savingId.set(schedule.id);
    this.savedId.set(null);
    this.errorById.update((m) => {
      const next = new Map(m);
      next.delete(schedule.id);
      return next;
    });
    this.api
      .updateService(schedule.id, { time: schedule.time, note: schedule.note, streamed: schedule.streamed })
      .subscribe({
        next: () => {
          this.savingId.set(null);
          this.savedId.set(schedule.id);
          setTimeout(() => {
            if (this.savedId() === schedule.id) {
              this.savedId.set(null);
            }
          }, 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.savingId.set(null);
          this.errorById.update((m) => new Map(m).set(schedule.id, err.error?.error ?? 'No se pudo guardar.'));
        },
      });
  }

  toggleStreamed(schedule: ServiceScheduleItem): void {
    schedule.streamed = !schedule.streamed;
    this.save(schedule);
  }

  toggleBanner(): void {
    const next = { liveBannerVisible: !this.siteSettings().liveBannerVisible };
    this.api.updateSiteSettings(next).subscribe(() => this.siteSettings.set(next));
  }
}
