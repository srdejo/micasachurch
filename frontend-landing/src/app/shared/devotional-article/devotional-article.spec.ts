import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

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

function render(value: DevotionalEntry) {
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
});
