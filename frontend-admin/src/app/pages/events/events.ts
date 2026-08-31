import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, EventItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
})
export class Events implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly events = signal<EventItem[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.listEvents().subscribe((data) => this.events.set(data));
  }

  addNew(): void {
    this.api
      .createEvent({ day: '1', month: 'Ene', title: 'Nuevo evento', detail: '', published: false, displayOrder: this.events().length + 1 })
      .subscribe(() => this.reload());
  }

  save(event: EventItem): void {
    this.api
      .updateEvent(event.id, {
        day: event.day,
        month: event.month,
        title: event.title,
        detail: event.detail,
        published: event.published,
        displayOrder: event.displayOrder,
      })
      .subscribe(() => this.reload());
  }

  remove(id: string): void {
    this.api.deleteEvent(id).subscribe(() => this.reload());
  }
}
