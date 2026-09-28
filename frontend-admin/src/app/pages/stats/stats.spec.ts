import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { STATS_CONFIG, Stats } from './stats';

const REPORT = 'https://lookerstudio.google.com/embed/reporting/abc/page/def';
const APP = 'https://analytics.google.com/analytics/web/#/p123';

function render(reportUrl: string) {
  TestBed.configureTestingModule({ providers: [{ provide: STATS_CONFIG, useValue: { reportUrl, appUrl: APP } }] });
  const fixture = TestBed.createComponent(Stats);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Stats', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('muestra el informe incrustado y el enlace a Google Analytics', () => {
    const el = render(REPORT);
    const link = el.querySelector('a')!;

    expect(el.querySelector('iframe')?.getAttribute('src')).toBe(REPORT);
    expect(link.textContent?.trim()).toBe('Abrir Google Analytics');
    expect(link.getAttribute('href')).toBe(APP);
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('sin informe configurado muestra el aviso y conserva el enlace', () => {
    const el = render('');

    expect(el.querySelector('iframe')).toBeNull();
    expect(el.textContent).toContain('Las estadísticas no están disponibles en este momento.');
    expect(el.querySelector('a')?.getAttribute('href')).toBe(APP);
  });
});
