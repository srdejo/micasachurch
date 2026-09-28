import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DevotionalEntry } from '../../core/devotional-api.service';
import { Home } from './home';

const FACEBOOK = 'https://www.facebook.com/micasachurchocana';
const devotionalService = {
  id: 'devo', day: 'Todos los días', time: '7:00 a.m.', note: 'Devocional diario en vivo',
  streamed: true, displayOrder: 0, durationMinutes: 45,
};
const devotional: DevotionalEntry = {
  title: 'Orar por ellos', passage_reference: 'Mateo 18:10-14', verse: '¿No deja las noventa y nueve…?',
  content: '<p>Reflexión</p>', audio_url: 'https://example.com/lectura.mp3',
};

interface Options {
  /** Hora en Colombia, p. ej. '2026-09-30T07:10:00'. */
  at: string;
  liveBannerVisible?: boolean;
  entry?: DevotionalEntry;
}

async function setup({ at, liveBannerVisible = true, entry = devotional }: Options) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${at}-05:00`));
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  const fixture = TestBed.createComponent(Home);
  const http = TestBed.inject(HttpTestingController);
  fixture.detectChanges();

  const bodies: Record<string, object> = {
    '/services': [devotionalService],
    '/site-settings': { liveBannerVisible, activeTheme: 'Naranja' },
    '/links': [{ id: 'fb', key: 'facebook', label: 'Facebook', value: FACEBOOK }],
  };
  for (const req of http.match(() => true)) {
    if (req.request.url.includes('devotionals')) {
      req.flush([entry]);
      continue;
    }
    const path = Object.keys(bodies).find((p) => req.request.url.endsWith(p));
    req.flush(path ? bodies[path] : []);
  }
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('Prédicas no tiene botón "En vivo"', async () => {
    const el = await setup({ at: '2026-09-30T15:00:00' });
    const predicas = el.querySelector('#predicas')!;

    expect(predicas.textContent).toContain('Suscribirse');
    expect(predicas.textContent).not.toMatch(/en vivo/i);
  });

  it('durante una transmisión la barra móvil solo tiene "En vivo"', async () => {
    const el = await setup({ at: '2026-09-30T07:10:00' });
    const bar = el.querySelector('[data-testid="mobile-live-bar"]');

    expect(bar).not.toBeNull();
    const links = bar!.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain('En vivo');
    expect(links[0].getAttribute('href')).toBe(FACEBOOK);
    expect(bar!.textContent).not.toContain('WhatsApp');
    expect(el.querySelector('footer')!.className).toContain('max-[980px]:pb-32');
  });

  it('sin transmisión no hay barra ni espacio reservado en el footer', async () => {
    const el = await setup({ at: '2026-09-30T15:00:00' });

    expect(el.querySelector('[data-testid="mobile-live-bar"]')).toBeNull();
    expect(el.querySelector('footer')!.className).not.toContain('max-[980px]:pb-32');
  });

  it('con la franja oculta desde el admin tampoco hay barra', async () => {
    const el = await setup({ at: '2026-09-30T07:10:00', liveBannerVisible: false });

    expect(el.querySelector('[data-testid="mobile-live-bar"]')).toBeNull();
  });

  it('la tarjeta del devocional trae el reproductor fuera de cualquier enlace', async () => {
    const el = await setup({ at: '2026-09-30T15:00:00' });
    const card = el.querySelector('[data-testid="devotional-card"]')!;

    expect(card.tagName).toBe('ARTICLE');
    expect(card.querySelector('app-audio-player')).not.toBeNull();
    expect(card.querySelector('a app-audio-player, a button, a input')).toBeNull();
    const title = [...card.querySelectorAll('a')].find((a) => a.textContent?.includes('Orar por ellos'));
    expect(title?.getAttribute('href')).toBe('/devocional');
    expect([...card.querySelectorAll('a')].some((a) => a.textContent?.includes('Leer completo'))).toBe(true);
  });

  it('sin audio la tarjeta no tiene reproductor', async () => {
    const el = await setup({ at: '2026-09-30T15:00:00', entry: { ...devotional, audio_url: undefined } });

    expect(el.querySelector('[data-testid="devotional-card"] app-audio-player')).toBeNull();
  });
});
