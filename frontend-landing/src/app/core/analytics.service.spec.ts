import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { ANALYTICS_CONFIG, AnalyticsConfig, AnalyticsService } from './analytics.service';

type TestWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const win = window as TestWindow;

function setup(config: AnalyticsConfig, platform = 'browser') {
  TestBed.configureTestingModule({
    providers: [
      { provide: ANALYTICS_CONFIG, useValue: config },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });
  return TestBed.inject(AnalyticsService);
}

const gtagScripts = () => document.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
const layer = () => (win.dataLayer ?? []).map((entry) => [...(entry as IArguments)]);

describe('AnalyticsService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    gtagScripts().forEach((script) => script.remove());
    delete win.dataLayer;
    delete win.gtag;
  });

  it('sin ID de medición no carga nada', () => {
    setup({ measurementId: '', debug: false }).start();

    expect(gtagScripts().length).toBe(0);
    expect(win.gtag).toBeUndefined();
  });

  it('en el servidor no carga nada', () => {
    setup({ measurementId: 'G-TEST', debug: false }, 'server').start();

    expect(gtagScripts().length).toBe(0);
    expect(win.gtag).toBeUndefined();
  });

  it('en el navegador carga una sola etiqueta asíncrona y configura GA4', () => {
    const service = setup({ measurementId: 'G-TEST', debug: false });
    service.start();
    service.start();

    const scripts = gtagScripts();
    expect(scripts.length).toBe(1);
    expect((scripts[0] as HTMLScriptElement).async).toBe(true);
    expect((scripts[0] as HTMLScriptElement).src).toContain('id=G-TEST');
    expect(layer()[1]).toEqual(['config', 'G-TEST', {}]);
  });

  it('en modo depuración marca el tráfico con debug_mode', () => {
    setup({ measurementId: 'G-TEST', debug: true }).start();

    expect(layer()[1]).toEqual(['config', 'G-TEST', { debug_mode: true }]);
  });

  it('track envía el evento con sus parámetros', () => {
    const service = setup({ measurementId: 'G-TEST', debug: false });
    service.start();
    service.track('en_vivo', { origen: 'header' });

    expect(layer().at(-1)).toEqual(['event', 'en_vivo', { origen: 'header' }]);
  });

  it('track no hace nada sin configuración y no rompe si gtag falla', () => {
    const disabled = setup({ measurementId: '', debug: false });
    expect(() => disabled.track('en_vivo')).not.toThrow();
    TestBed.resetTestingModule();

    const service = setup({ measurementId: 'G-TEST', debug: false });
    service.start();
    win.gtag = () => {
      throw new Error('blocked');
    };
    expect(() => service.track('en_vivo')).not.toThrow();
  });
});
