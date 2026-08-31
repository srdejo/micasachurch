import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, LinkEntryItem } from '../../core/admin-api.service';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './links.html',
})
export class Links implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly links = signal<LinkEntryItem[]>([]);

  ngOnInit(): void {
    this.api.listLinks().subscribe((data) => this.links.set(data));
  }

  save(link: LinkEntryItem): void {
    this.api.updateLink(link.id, { value: link.value }).subscribe();
  }
}
