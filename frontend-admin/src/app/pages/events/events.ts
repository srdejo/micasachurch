import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, EventItem } from '../../core/admin-api.service';
import { PublishStateService } from '../../core/publish-state.service';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
})
export class Events implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly publishState = inject(PublishStateService);

  readonly events = signal<EventItem[]>([]);
  readonly status = signal<Record<string, SaveStatus>>({});
  readonly errorMessage = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.listEvents().subscribe((data) => this.events.set(data));
  }

  addNew(): void {
    this.api
      .createEvent({ day: '1', month: 'Ene', title: 'Nuevo evento', detail: '', published: false, displayOrder: this.events().length + 1 })
      .subscribe(() => {
        this.reload();
        this.publishState.refresh();
      });
  }

  save(event: EventItem): void {
    this.status.update((s) => ({ ...s, [event.id]: 'saving' }));
    this.api
      .updateEvent(event.id, {
        day: event.day,
        month: event.month,
        title: event.title,
        detail: event.detail,
        published: event.published,
        displayOrder: event.displayOrder,
      })
      .subscribe({
        next: () => {
          this.status.update((s) => ({ ...s, [event.id]: 'saved' }));
          this.publishState.refresh();
          setTimeout(() => this.status.update((s) => ({ ...s, [event.id]: 'idle' })), 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.status.update((s) => ({ ...s, [event.id]: 'error' }));
          this.errorMessage.update((m) => ({ ...m, [event.id]: err.error?.error ?? 'No se pudo guardar.' }));
        },
      });
  }

  remove(id: string): void {
    this.api.deleteEvent(id).subscribe(() => this.reload());
  }
}
