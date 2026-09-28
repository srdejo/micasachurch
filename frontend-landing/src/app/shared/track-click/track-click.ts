import { Directive, inject, input } from '@angular/core';
import { AnalyticsParams, AnalyticsService } from '../../core/analytics.service';

/** Sends a GA4 event on click without touching what the control does (no preventDefault, no wait). */
@Directive({
  selector: '[appTrackClick]',
  standalone: true,
  host: { '(click)': 'onClick()' },
})
export class TrackClick {
  private readonly analytics = inject(AnalyticsService);

  readonly appTrackClick = input.required<string>();
  readonly trackParams = input<AnalyticsParams | undefined>(undefined);

  onClick(): void {
    this.analytics.track(this.appTrackClick(), this.trackParams());
  }
}
