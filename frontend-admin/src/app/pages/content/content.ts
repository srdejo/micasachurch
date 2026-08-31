import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, MinistryItem, SiteContentItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content.html',
})
export class ContentPage implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly siteContent = signal<SiteContentItem[]>([]);
  readonly ministries = signal<MinistryItem[]>([]);

  ngOnInit(): void {
    this.api.listSiteContent().subscribe((data) => this.siteContent.set(data));
    this.reloadMinistries();
  }

  private reloadMinistries(): void {
    this.api.listMinistries().subscribe((data) => this.ministries.set(data));
  }

  saveContent(item: SiteContentItem): void {
    this.api.updateSiteContent(item.id, item.value).subscribe();
  }

  saveMinistry(ministry: MinistryItem): void {
    this.api
      .updateMinistry(ministry.id, {
        name: ministry.name,
        description: ministry.description,
        displayOrder: ministry.displayOrder,
      })
      .subscribe();
  }

  addMinistry(): void {
    const displayOrder = this.ministries().length + 1;
    this.api
      .createMinistry({ name: 'Nuevo ministerio', description: '', displayOrder })
      .subscribe(() => this.reloadMinistries());
  }

  deleteMinistry(ministry: MinistryItem): void {
    if (!confirm(`¿Eliminar el ministerio "${ministry.name}"?`)) {
      return;
    }
    this.api.deleteMinistry(ministry.id).subscribe(() => this.reloadMinistries());
  }
}
