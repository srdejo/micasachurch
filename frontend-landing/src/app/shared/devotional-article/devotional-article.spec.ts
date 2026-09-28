import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BibleApiService } from '../../core/bible-api.service';

import { DevotionalEntry } from '../../core/devotional-api.service';
import { DevotionalArticle } from './devotional-article';

const entry: DevotionalEntry = {
  title: 'Orar por ellos',
  passage_reference: 'Mateo 18:10-14',
  verse: '¿No deja las noventa y nueve…?',
  content: '<p>Reflexión</p>',
  audio_url: 'https://example.com/lectura.mp3',
  bible_in_a_year_references: 'Isaías 3–4; Gálatas 6',
};

function fakeBibleApi(isEnabled = true) {
  return {
    isEnabled,
    listSpanishVersions: vi.fn().mockResolvedValue([{ id: 3365, abbreviation: 'PdDpt', title: 'Palabra de Dios para ti' }]),
    preferredVersion: vi.fn((list: unknown[]) => list[0]),
    rememberVersion: vi.fn(),
    getPassage: vi.fn().mockResolvedValue({ html: '<p>texto</p>', attribution: '© PdDpt' }),
  };
}

function render(value: DevotionalEntry, bibleApi = fakeBibleApi()) {
  TestBed.configureTestingModule({ providers: [{ provide: BibleApiService, useValue: bibleApi }] });
  const fixture = TestBed.createComponent(DevotionalArticle);
  fixture.componentRef.setInput('entry', value);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

/** Posición de cada bloque dentro del artículo, en el orden del DOM. */
function order(el: HTMLElement): string[] {
  return [...el.querySelector('article')!.children].map((child) => {
    if (child.matches('[data-testid="bible-in-a-year"]')) return 'biblia';
    if (child.tagName === 'APP-AUDIO-PLAYER') return 'audio';
    if (child.tagName === 'H3') return 'titulo';
    if (child.tagName === 'BLOCKQUOTE') return 'versiculo';
    if (child.textContent?.startsWith('Lectura')) return 'lectura';
    return 'reflexion';
  });
}

describe('DevotionalArticle', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('la Biblia en un año va arriba y el audio justo debajo del título', () => {
    expect(order(render(entry))).toEqual(['biblia', 'lectura', 'titulo', 'audio', 'versiculo', 'reflexion']);
  });

  it('sin audio no hay reproductor ni hueco', () => {
    const el = render({ ...entry, audio_url: undefined });

    expect(order(el)).toEqual(['biblia', 'lectura', 'titulo', 'versiculo', 'reflexion']);
    expect(el.querySelector('audio')).toBeNull();
  });

  it('sin plan anual empieza por la lectura', () => {
    expect(order(render({ ...entry, bible_in_a_year_references: undefined }))[0]).toBe('lectura');
  });

  it('cada referencia es un botón que abre el lector en esa lectura, sin consultar nada antes', async () => {
    const bibleApi = fakeBibleApi();
    const el = render(entry, bibleApi);
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="bible-in-a-year"] button')];

    expect(buttons.map((b) => b.textContent?.replace('→', '').trim())).toEqual(['Isaías 3–4', 'Gálatas 6']);
    expect(bibleApi.listSpanishVersions).not.toHaveBeenCalled();
    expect(bibleApi.getPassage).not.toHaveBeenCalled();

    buttons[1].click();
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));

    const reader = el.querySelector('app-bible-reader [role="dialog"]')!;
    expect(reader.getAttribute('aria-label')).toBe('Lectura: Gálatas 6');
    expect(bibleApi.getPassage).toHaveBeenCalledWith(3365, 'GAL.6');
    expect(order(el)).toEqual(['biblia', 'lectura', 'titulo', 'audio', 'versiculo', 'reflexion']);
  });

  it('sin App Key las referencias quedan como texto', () => {
    const el = render(entry, fakeBibleApi(false));
    const box = el.querySelector('[data-testid="bible-in-a-year"]')!;

    expect(box.querySelector('button')).toBeNull();
    expect(box.textContent).toContain('Isaías 3–4;');
    expect(box.textContent).toContain('Gálatas 6');
  });

  it('una referencia no reconocida queda como texto y las demás siguen siendo botones', () => {
    const el = render({ ...entry, bible_in_a_year_references: 'Isaías 3–4; Texto raro 9' });
    const box = el.querySelector('[data-testid="bible-in-a-year"]')!;

    expect([...box.querySelectorAll('button')].map((b) => b.textContent?.replace('→', '').trim())).toEqual(['Isaías 3–4']);
    expect(box.textContent).toContain('Texto raro 9');
  });
});
