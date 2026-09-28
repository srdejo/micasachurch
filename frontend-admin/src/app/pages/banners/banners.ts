import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, HeroBannerItem, HeroBannerPayload } from '../../core/admin-api.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

const NEW_BANNER_TITLE = 'Nuevo banner';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './banners.html',
})
export class Banners implements OnInit {
  readonly api = inject(AdminApiService);

  readonly banners = signal<HeroBannerItem[]>([]);
  readonly busyId = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly errorById = signal<Map<string, string>>(new Map());
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly pendingDelete = signal<HeroBannerItem | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.api.listBanners().subscribe((data) => this.banners.set(data));
  }

  private payload(banner: HeroBannerItem): HeroBannerPayload {
    return {
      kicker: banner.kicker?.trim() || null,
      title: banner.title,
      text: banner.text?.trim() || null,
      ctaLabel: banner.ctaLabel?.trim() || null,
      ctaHref: banner.ctaHref?.trim() || null,
      active: banner.active,
    };
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

  private replace(saved: HeroBannerItem): void {
    this.banners.update((list) => list.map((b) => (b.id === saved.id ? saved : b)));
  }

  save(banner: HeroBannerItem, onError?: () => void): void {
    this.busyId.set(banner.id);
    this.savedId.set(null);
    this.setError(banner.id, null);
    this.api.updateBanner(banner.id, this.payload(banner)).subscribe({
      next: (saved) => {
        this.busyId.set(null);
        this.replace(saved);
        this.savedId.set(banner.id);
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        onError?.();
        this.setError(banner.id, err.error?.error ?? 'No se pudo guardar el banner.');
      },
    });
  }

  toggleActive(banner: HeroBannerItem): void {
    const previous = banner.active;
    banner.active = !banner.active;
    this.save(banner, () => (banner.active = previous));
  }

  onFileSelected(banner: HeroBannerItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.busyId.set(banner.id);
    this.setError(banner.id, null);
    this.api.uploadBannerImage(banner.id, file).subscribe({
      next: (saved) => {
        this.busyId.set(null);
        this.replace(saved);
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.setError(banner.id, err.error?.error ?? 'No se pudo subir la imagen.');
      },
    });
  }

  add(): void {
    this.creating.set(true);
    this.createError.set(null);
    this.api.createBanner(NEW_BANNER_TITLE).subscribe({
      next: (created) => {
        this.creating.set(false);
        this.banners.update((list) => [...list, created]);
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.createError.set(err.error?.error ?? 'No se pudo crear el banner.');
      },
    });
  }

  confirmDelete(): void {
    const banner = this.pendingDelete();
    if (!banner) {
      return;
    }
    this.deleting.set(true);
    this.api.deleteBanner(banner.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.setError(banner.id, err.error?.error ?? 'No se pudo eliminar el banner.');
      },
    });
  }
}
