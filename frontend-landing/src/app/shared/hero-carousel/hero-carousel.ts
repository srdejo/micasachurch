import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, afterNextRender, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChurchApiService, HeroBannerItem } from '../../core/church-api.service';

export const HERO_ROTATION_MS = 6500;
const SWIPE_THRESHOLD_PX = 40;
const SCHEDULE_HREF = '#horarios';

/** Lo que se muestra si no hay banners activos o el API no responde. */
export const DEFAULT_BANNER: HeroBannerItem = {
  id: 'default',
  kicker: 'Ocaña, Norte de Santander',
  title: 'Mi casa es tu casa',
  text: 'Un lugar donde solo pasan cosas buenas. Queremos conocerte: ven y visítanos, tal como estás.',
  ctaLabel: 'Ver horarios',
  ctaHref: SCHEDULE_HREF,
  imageKey: null,
  imageUpdatedAt: null,
  active: true,
  displayOrder: 0,
};

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, NgClass],
  templateUrl: './hero-carousel.html',
})
export class HeroCarousel {
  private readonly api = inject(ChurchApiService);

  readonly banners = input<HeroBannerItem[]>([]);
  /** Pausa externa, p. ej. mientras la ventana de horarios está abierta. */
  readonly paused = input(false);
  readonly openSchedule = output<void>();

  readonly current = signal(0);
  readonly hovering = signal(false);
  private readonly failedImages = signal<ReadonlySet<string>>(new Set());
  private touchStartX: number | null = null;

  readonly slides = computed(() => {
    const list = this.banners().filter((b) => b.active);
    return list.length > 0 ? list : [DEFAULT_BANNER];
  });

  readonly active = computed(() => Math.min(this.current(), this.slides().length - 1));
  readonly counter = computed(
    () => `${String(this.active() + 1).padStart(2, '0')} / ${String(this.slides().length).padStart(2, '0')}`,
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => {
        if (!this.hovering() && !this.paused()) {
          this.go(1);
        }
      }, HERO_ROTATION_MS);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  go(direction: number): void {
    const count = this.slides().length;
    this.current.set((((this.active() + direction) % count) + count) % count);
  }

  select(index: number): void {
    this.current.set(index);
  }

  imageFor(banner: HeroBannerItem): string | null {
    const url = this.api.bannerImageUrl(banner);
    return url && !this.failedImages().has(url) ? url : null;
  }

  markImageFailed(url: string): void {
    this.failedImages.update((failed) => new Set(failed).add(url));
  }

  isSchedule(banner: HeroBannerItem): boolean {
    return banner.ctaHref === SCHEDULE_HREF;
  }

  isRoute(banner: HeroBannerItem): boolean {
    return !!banner.ctaHref?.startsWith('/');
  }

  isExternal(banner: HeroBannerItem): boolean {
    return !!banner.ctaHref?.startsWith('https://');
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    const end = event.changedTouches[0]?.clientX;
    if (this.touchStartX === null || end === undefined) {
      return;
    }
    const delta = end - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      this.go(delta < 0 ? 1 : -1);
    }
  }
}
