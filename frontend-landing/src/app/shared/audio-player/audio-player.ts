import { NgClass } from '@angular/common';
import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { AnalyticsService } from '../../core/analytics.service';

const SPEEDS = [1, 1.25, 1.5];

function formatSeconds(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/**
 * Reproductor del audio del devocional. Reemplaza el <audio controls> nativo, que se ve distinto
 * en cada navegador y no se puede adaptar al diseño.
 */
@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [NgClass],
  templateUrl: './audio-player.html',
})
export class AudioPlayer {
  private readonly analytics = inject(AnalyticsService);

  readonly src = input.required<string>();
  /** `dark` sobre el fondo tinta de /devocional, `light` sobre la tarjeta clara del home. */
  readonly variant = input<'dark' | 'light'>('dark');
  /** Where the player lives, reported with the `devocional_audio` event. */
  readonly page = input<'inicio' | 'devocional' | undefined>(undefined);

  readonly playing = signal(false);
  readonly current = signal(0);
  readonly duration = signal(0);
  readonly rate = signal(1);
  readonly failed = signal(false);

  readonly progress = computed(() => (this.duration() > 0 ? (this.current() / this.duration()) * 100 : 0));
  readonly timeLabel = computed(() => `${formatSeconds(this.current())} / ${formatSeconds(this.duration())}`);

  private trackedSrc: string | null = null;

  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  private get element(): HTMLAudioElement | undefined {
    return this.audio()?.nativeElement;
  }

  toggle(): void {
    const el = this.element;
    if (!el) {
      return;
    }
    if (el.paused) {
      el.play()?.catch(() => this.playing.set(false));
    } else {
      el.pause();
    }
  }

  seek(value: string): void {
    const el = this.element;
    const seconds = Number(value);
    if (el && Number.isFinite(seconds)) {
      el.currentTime = seconds;
      this.current.set(seconds);
    }
  }

  cycleRate(): void {
    const next = SPEEDS[(SPEEDS.indexOf(this.rate()) + 1) % SPEEDS.length];
    this.rate.set(next);
    if (this.element) {
      this.element.playbackRate = next;
    }
  }

  rateLabel(): string {
    return `${this.rate()}×`;
  }

  onPlay(): void {
    this.playing.set(true);
    const page = this.page();
    // Counts the first play of each reading; resuming after a pause is the same listen.
    if (page && this.trackedSrc !== this.src()) {
      this.trackedSrc = this.src();
      this.analytics.track('devocional_audio', { pagina: page });
    }
  }

  onLoadedMetadata(): void {
    this.duration.set(this.element?.duration ?? 0);
  }

  onTimeUpdate(): void {
    this.current.set(this.element?.currentTime ?? 0);
  }

  onEnded(): void {
    this.playing.set(false);
    this.current.set(0);
  }
}
