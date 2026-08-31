import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DevotionalApiService, DevotionalEntry } from '../../core/devotional-api.service';
import { DevotionalArticle } from '../../shared/devotional-article/devotional-article';

@Component({
  selector: 'app-devocional',
  standalone: true,
  imports: [CommonModule, RouterLink, DevotionalArticle],
  templateUrl: './devocional.html',
})
export class Devocional implements OnInit {
  private readonly api = inject(DevotionalApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly entry = signal<DevotionalEntry | null>(null);
  readonly currentDate = signal(new Date());
  readonly fontScale = signal(1);
  readonly shared = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const fecha = params.get('fecha');
      this.currentDate.set(fecha ? new Date(fecha + 'T00:00:00') : new Date());
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getByDate(this.currentDate()).subscribe({
      next: (entry) => {
        this.entry.set(entry);
        this.loading.set(false);
        if (!entry) {
          this.error.set(true);
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  retry(): void {
    this.load();
  }

  goToDate(offsetDays: number): void {
    const next = new Date(this.currentDate());
    next.setDate(next.getDate() + offsetDays);
    const iso = next.toISOString().slice(0, 10);
    this.router.navigate([], { queryParams: { fecha: iso } });
  }

  onDatePicked(value: string): void {
    if (value) {
      this.router.navigate([], { queryParams: { fecha: value } });
    }
  }

  formattedDate(): string {
    return this.currentDate().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  isoDate(): string {
    return this.currentDate().toISOString().slice(0, 10);
  }

  increaseFont(): void {
    this.fontScale.set(Math.min(this.fontScale() + 0.1, 1.6));
  }

  decreaseFont(): void {
    this.fontScale.set(Math.max(this.fontScale() - 0.1, 0.8));
  }

  async share(): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = this.entry()?.title ?? 'Devocional';
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
    this.shared.set(true);
    setTimeout(() => this.shared.set(false), 2200);
  }
}
