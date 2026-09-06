import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, ServiceScheduleItem, SiteSettings } from '../../core/admin-api.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './schedules.html',
})
export class Schedules implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly schedules = signal<ServiceScheduleItem[]>([]);
  readonly siteSettings = signal<SiteSettings>({ liveBannerVisible: true });

  readonly savingId = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly errorById = signal<Map<string, string>>(new Map());

  readonly newDay = signal('');
  readonly newTime = signal('');
  readonly newNote = signal('');
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  readonly pendingDelete = signal<ServiceScheduleItem | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.reload();
    this.api.getSiteSettings().subscribe((data) => this.siteSettings.set(data));
  }

  private reload(): void {
    this.api.listServices().subscribe((data) => this.schedules.set(data));
  }

  save(schedule: ServiceScheduleItem, onError?: () => void): void {
    this.savingId.set(schedule.id);
    this.savedId.set(null);
    this.errorById.update((m) => {
      const next = new Map(m);
      next.delete(schedule.id);
      return next;
    });
    this.api
      .updateService(schedule.id, { day: schedule.day, time: schedule.time, note: schedule.note, streamed: schedule.streamed })
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
          onError?.();
          this.errorById.update((m) => new Map(m).set(schedule.id, err.error?.error ?? 'No se pudo guardar.'));
        },
      });
  }

  toggleStreamed(schedule: ServiceScheduleItem): void {
    // El check se pinta con el valor local, asi que si el guardado falla hay que devolverlo
    // a como estaba: si no, la casilla queda marcada y en el sitio publico no cambio nada.
    const previous = schedule.streamed;
    schedule.streamed = !schedule.streamed;
    this.save(schedule, () => {
      schedule.streamed = previous;
    });
  }

  add(): void {
    const day = this.newDay().trim();
    const time = this.newTime().trim();
    if (!day || !time) {
      return;
    }
    this.creating.set(true);
    this.createError.set(null);
    this.api.createService({ day, time, note: this.newNote().trim(), streamed: false }).subscribe({
      next: () => {
        this.creating.set(false);
        this.newDay.set('');
        this.newTime.set('');
        this.newNote.set('');
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.createError.set(err.error?.error ?? 'No se pudo agregar el servicio.');
      },
    });
  }

  askDelete(schedule: ServiceScheduleItem): void {
    this.pendingDelete.set(schedule);
  }

  confirmDelete(): void {
    const schedule = this.pendingDelete();
    if (!schedule) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteService(schedule.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.errorById.update((m) => new Map(m).set(schedule.id, err.error?.error ?? 'No se pudo eliminar.'));
      },
    });
  }

  toggleBanner(): void {
    const next = { liveBannerVisible: !this.siteSettings().liveBannerVisible };
    this.api.updateSiteSettings(next).subscribe(() => this.siteSettings.set(next));
  }
}
