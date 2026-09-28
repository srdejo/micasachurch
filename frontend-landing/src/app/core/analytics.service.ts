import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AnalyticsConfig {
  measurementId: string;
  /** Local test traffic: shows up in GA4 DebugView and the developer-traffic filter keeps it out of reports. */
  debug: boolean;
}

export type AnalyticsParams = Record<string, string>;

export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('ANALYTICS_CONFIG', {
  providedIn: 'root',
  factory: () => environment.analytics,
});

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };

/**
 * Google Analytics 4, loaded only in the visitor's browser and only when a measurement id is set.
 * Page views of router navigations come from GA4's enhanced measurement (browser history events).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly config = inject(ANALYTICS_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;

  start(): void {
    const { measurementId, debug } = this.config;
    if (this.started || !this.isBrowser || !measurementId) return;
    this.started = true;

    const win = this.document.defaultView as AnalyticsWindow;
    win.dataLayer = win.dataLayer ?? [];
    // gtag.js reads the `arguments` object, not an array, from the data layer.
    win.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      win.dataLayer!.push(arguments);
    };
    win.gtag('js', new Date());
    win.gtag('config', measurementId, debug ? { debug_mode: true } : {});

    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    this.document.head.appendChild(script);
  }

  track(name: string, params?: AnalyticsParams): void {
    if (!this.started) return;
    try {
      const win = this.document.defaultView as AnalyticsWindow;
      win.gtag?.('event', name, params ?? {});
    } catch {
      // Analytics must never break the control that triggered it.
    }
  }
}
