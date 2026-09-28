import { Component, InjectionToken, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface StatsConfig {
  /** Looker Studio embed URL (`https://lookerstudio.google.com/embed/reporting/…`). */
  reportUrl: string;
  appUrl: string;
}

export const STATS_CONFIG = new InjectionToken<StatsConfig>('STATS_CONFIG', {
  providedIn: 'root',
  factory: () => ({ reportUrl: environment.statsReportUrl, appUrl: environment.statsAppUrl }),
});

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.html',
})
export class Stats {
  private readonly config = inject(STATS_CONFIG);

  readonly appUrl = this.config.appUrl;
  // Trusted: the URL comes from our own build configuration, never from user input.
  readonly reportUrl: SafeResourceUrl | null = this.config.reportUrl
    ? inject(DomSanitizer).bypassSecurityTrustResourceUrl(this.config.reportUrl)
    : null;
}
