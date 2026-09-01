import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, MinistryItem, SiteContentItem } from '../../core/admin-api.service';
import { PublishStateService } from '../../core/publish-state.service';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content.html',
})
export class ContentPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly publishState = inject(PublishStateService);

  readonly siteContent = signal<SiteContentItem[]>([]);
  readonly ministries = signal<MinistryItem[]>([]);

  readonly contentStatus = signal<Record<string, SaveStatus>>({});
  readonly contentError = signal<Record<string, string>>({});
  readonly ministryStatus = signal<Record<string, SaveStatus>>({});
  readonly ministryError = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.api.listSiteContent().subscribe((data) => this.siteContent.set(data));
    this.reloadMinistries();
  }

  private reloadMinistries(): void {
    this.api.listMinistries().subscribe((data) => this.ministries.set(data));
  }

  saveContent(item: SiteContentItem): void {
    this.contentStatus.update((s) => ({ ...s, [item.id]: 'saving' }));
    this.api.updateSiteContent(item.id, item.value).subscribe({
      next: () => {
        this.contentStatus.update((s) => ({ ...s, [item.id]: 'saved' }));
        this.publishState.refresh();
        setTimeout(() => this.contentStatus.update((s) => ({ ...s, [item.id]: 'idle' })), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.contentStatus.update((s) => ({ ...s, [item.id]: 'error' }));
        this.contentError.update((m) => ({ ...m, [item.id]: err.error?.error ?? 'No se pudo guardar.' }));
      },
    });
  }

  saveMinistry(ministry: MinistryItem): void {
    this.ministryStatus.update((s) => ({ ...s, [ministry.id]: 'saving' }));
    this.api
      .updateMinistry(ministry.id, {
        name: ministry.name,
        description: ministry.description,
        displayOrder: ministry.displayOrder,
      })
      .subscribe({
        next: () => {
          this.ministryStatus.update((s) => ({ ...s, [ministry.id]: 'saved' }));
          this.publishState.refresh();
          setTimeout(() => this.ministryStatus.update((s) => ({ ...s, [ministry.id]: 'idle' })), 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.ministryStatus.update((s) => ({ ...s, [ministry.id]: 'error' }));
          this.ministryError.update((m) => ({ ...m, [ministry.id]: err.error?.error ?? 'No se pudo guardar.' }));
        },
      });
  }

  addMinistry(): void {
    const displayOrder = this.ministries().length + 1;
    this.api
      .createMinistry({ name: 'Nuevo ministerio', description: '', displayOrder })
      .subscribe(() => {
        this.reloadMinistries();
        this.publishState.refresh();
      });
  }

  deleteMinistry(ministry: MinistryItem): void {
    if (!confirm(`¿Eliminar el ministerio "${ministry.name}"?`)) {
      return;
    }
    this.api.deleteMinistry(ministry.id).subscribe(() => this.reloadMinistries());
  }
}
