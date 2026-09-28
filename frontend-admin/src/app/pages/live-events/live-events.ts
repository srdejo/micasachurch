import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, LiveEventItem, LiveEventPayload, ServiceScheduleItem } from '../../core/admin-api.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

const DEFAULT_URL = 'https://www.facebook.com/micasachurchocana';

function emptyDraft(): LiveEventPayload {
  return { title: '', date: '', startTime: '19:00', durationMinutes: 120, url: DEFAULT_URL, active: true };
}

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './live-events.html',
})
export class LiveEvents implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly events = signal<LiveEventItem[]>([]);
  readonly services = signal<ServiceScheduleItem[]>([]);
  readonly streamedServices = computed(() => this.services().filter((s) => s.streamed));

  readonly draft = signal<LiveEventPayload>(emptyDraft());
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  readonly busyId = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly errorById = signal<Map<string, string>>(new Map());
  readonly pendingDelete = signal<LiveEventItem | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.reload();
    this.api.listServices().subscribe((data) => this.services.set(data));
  }

  private reload(): void {
    this.api.listLiveEvents().subscribe((data) => this.events.set(data));
  }

  private setError(id: string, message: string | null): void {
    this.errorById.update((m) => {
      const next = new Map(m);
      if (message) {
        next.set(id, message);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private payload(event: LiveEventPayload): LiveEventPayload {
    return { ...event, title: event.title.trim(), url: event.url.trim(), durationMinutes: Number(event.durationMinutes) };
  }

  updateDraft(changes: Partial<LiveEventPayload>): void {
    this.draft.update((d) => ({ ...d, ...changes }));
  }

  create(): void {
    this.creating.set(true);
    this.createError.set(null);
    this.api.createLiveEvent(this.payload(this.draft())).subscribe({
      next: () => {
        this.creating.set(false);
        this.draft.set(emptyDraft());
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.createError.set(err.error?.error ?? 'No se pudo crear la transmisión.');
      },
    });
  }

  save(event: LiveEventItem, onError?: () => void): void {
    this.busyId.set(event.id);
    this.savedId.set(null);
    this.setError(event.id, null);
    const { id, ...rest } = event;
    this.api.updateLiveEvent(id, this.payload(rest)).subscribe({
      next: () => {
        this.busyId.set(null);
        this.savedId.set(id);
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        onError?.();
        this.setError(id, err.error?.error ?? 'No se pudo guardar la transmisión.');
      },
    });
  }

  toggleActive(event: LiveEventItem): void {
    const previous = event.active;
    event.active = !event.active;
    this.save(event, () => (event.active = previous));
  }

  confirmDelete(): void {
    const event = this.pendingDelete();
    if (!event) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteLiveEvent(event.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.setError(event.id, err.error?.error ?? 'No se pudo eliminar.');
      },
    });
  }
}
