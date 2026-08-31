import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService, SiteImageItem } from '../../core/admin-api.service';

interface ImageSlot {
  key: string;
  label: string;
  recommendation: string;
}

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images.html',
})
export class ImagesPage implements OnInit {
  readonly api = inject(AdminApiService);

  readonly slots: ImageSlot[] = [
    { key: 'logo', label: 'Logo (header)', recommendation: 'PNG con fondo transparente, cuadrado, mínimo 200×200px.' },
    { key: 'hero', label: 'Foto de portada (hero)', recommendation: 'JPG o PNG horizontal, mínimo 1600×900px.' },
    {
      key: 'quienes_somos',
      label: 'Foto "Quiénes somos"',
      recommendation: 'JPG o PNG vertical (proporción 4:5), mínimo 800×1000px.',
    },
    {
      key: 'og_image',
      label: 'Imagen para compartir (Open Graph)',
      recommendation: 'JPG o PNG de exactamente 1200×630px — es lo que se ve al compartir el link en WhatsApp/Facebook.',
    },
  ];

  readonly images = signal<Map<string, SiteImageItem>>(new Map());
  readonly uploading = signal<string | null>(null);
  readonly errors = signal<Map<string, string>>(new Map());

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.api.listSiteImages().subscribe((data) => {
      this.images.set(new Map(data.map((img) => [img.key, img])));
    });
  }

  imageUrl(key: string): string {
    return `${this.api.imageUrl(key)}?t=${this.images().get(key)?.updatedAt ?? ''}`;
  }

  hasImage(key: string): boolean {
    return this.images().has(key);
  }

  onFileSelected(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploading.set(key);
    this.errors.update((m) => {
      const next = new Map(m);
      next.delete(key);
      return next;
    });
    this.api.uploadSiteImage(key, file).subscribe({
      next: () => {
        this.uploading.set(null);
        this.reload();
      },
      error: (err) => {
        this.uploading.set(null);
        this.errors.update((m) => new Map(m).set(key, err.error?.error ?? 'No se pudo subir la imagen.'));
      },
    });
    input.value = '';
  }
}
