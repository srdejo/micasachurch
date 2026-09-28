import { NgClass } from '@angular/common';
import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';

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
  readonly src = input.required<string>();
  /** `dark` sobre el fondo tinta de /devocional, `light` sobre la tarjeta clara del home. */
  readonly variant = input<'dark' | 'light'>('dark');

  readonly playing = signal(false);
  readonly current = signal(0);
  readonly duration = signal(0);
  readonly rate = signal(1);
  readonly failed = signal(false);

  readonly progress = computed(() => (this.duration() > 0 ? (this.current() / this.duration()) * 100 : 0));
  readonly timeLabel = computed(() => `${formatSeconds(this.current())} / ${formatSeconds(this.duration())}`);

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
