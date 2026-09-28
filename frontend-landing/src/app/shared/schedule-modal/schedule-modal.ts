import { NgClass } from '@angular/common';
import { Component, DOCUMENT, DestroyRef, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { LiveStatus } from '../../core/live-status';
import { TrackClick } from '../track-click/track-click';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [NgClass, TrackClick],
  templateUrl: './schedule-modal.html',
  host: {
    '(document:keydown.escape)': 'close.emit()',
  },
})
export class ScheduleModal {
  readonly status = input<LiveStatus | null>(null);
  readonly mapsUrl = input.required<string>();
  readonly whatsappUrl = input.required<string>();
  readonly close = output<void>();

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    const body = inject(DOCUMENT).body;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      this.closeButton()?.nativeElement.focus();
      destroyRef.onDestroy(() => (body.style.overflow = previousOverflow));
    });
  }
}
