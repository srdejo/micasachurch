import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, LinkEntryItem } from '../../core/admin-api.service';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './links.html',
})
export class Links implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly links = signal<LinkEntryItem[]>([]);
  readonly status = signal<Record<string, SaveStatus>>({});

  ngOnInit(): void {
    this.api.listLinks().subscribe((data) => this.links.set(data));
  }

  save(link: LinkEntryItem): void {
    this.status.update((s) => ({ ...s, [link.id]: 'saving' }));
    this.api.updateLink(link.id, { value: link.value }).subscribe({
      next: () => {
        this.status.update((s) => ({ ...s, [link.id]: 'saved' }));
        setTimeout(() => this.status.update((s) => ({ ...s, [link.id]: 'idle' })), 2000);
      },
      error: () => this.status.update((s) => ({ ...s, [link.id]: 'error' })),
    });
  }
}
