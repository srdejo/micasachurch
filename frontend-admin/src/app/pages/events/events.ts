import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, EventItem } from '../../core/admin-api.service';
import { PublishStateService } from '../../core/publish-state.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './events.html',
})
export class Events implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly publishState = inject(PublishStateService);

  readonly events = signal<EventItem[]>([]);
  readonly status = signal<Record<string, SaveStatus>>({});
  readonly errorMessage = signal<Record<string, string>>({});
  /** Evento a la espera de confirmacion de borrado. */
  readonly pendingDelete = signal<EventItem | null>(null);
  readonly deleting = signal(false);

  constructor() {
    // Tras publicar, `hasDraft` cambia en el servidor: sin esto la fila seguiria diciendo
    // "Cambios sin publicar" aunque la cabecera ya diga "Todo publicado".
    effect(() => {
      if (this.publishState.publishedAt() > 0) {
        this.reload();
      }
    });
  }

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

  // Borrar es irreversible y el boton esta al lado de "Guardar": siempre pasa por confirmacion.
  askDelete(event: EventItem): void {
    this.pendingDelete.set(event);
  }

  confirmDelete(): void {
    const event = this.pendingDelete();
    if (!event) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteEvent(event.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.reload();
        this.publishState.refresh();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.status.update((s) => ({ ...s, [event.id]: 'error' }));
        this.errorMessage.update((m) => ({ ...m, [event.id]: err.error?.error ?? 'No se pudo eliminar.' }));
      },
    });
  }
}
