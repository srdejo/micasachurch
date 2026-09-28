import { describe, expect, it } from 'vitest';

import { parseBibleReferences } from './bible-reference';

const passages = (text: string) => parseBibleReferences(text).map((ref) => ref.passages);

describe('parseBibleReferences', () => {
  it('separa las lecturas del día y pide un capítulo por pasaje', () => {
    expect(parseBibleReferences('Isaías 3–4; Gálatas 6')).toEqual([
      { label: 'Isaías 3–4', passages: ['ISA.3', 'ISA.4'] },
      { label: 'Gálatas 6', passages: ['GAL.6'] },
    ]);
  });

  it('reconoce versículos y rangos dentro de un capítulo', () => {
    expect(passages('Salmos 119:1-24; Juan 3:16; Salmo 23')).toEqual([['PSA.119.1-24'], ['JHN.3.16'], ['PSA.23']]);
  });

  it('reconoce libros numerados y de varias palabras', () => {
    expect(passages('1 Corintios 13; 2Reyes 5; Cantar de los Cantares 1–2; Cantares 3')).toEqual([
      ['1CO.13'],
      ['2KI.5'],
      ['SNG.1', 'SNG.2'],
      ['SNG.3'],
    ]);
  });

  it('ignora mayúsculas, tildes y el tipo de guion', () => {
    expect(passages('ISAIAS 3-4')).toEqual(passages('isaías 3 — 4'));
    expect(passages('ISAIAS 3-4')).toEqual([['ISA.3', 'ISA.4']]);
  });

  it('deja como texto lo que no reconoce sin afectar las demás lecturas', () => {
    expect(parseBibleReferences('Isaías 3–4; Texto raro 9')).toEqual([
      { label: 'Isaías 3–4', passages: ['ISA.3', 'ISA.4'] },
      { label: 'Texto raro 9', passages: [] },
    ]);
  });

  it('no pide rangos de versículos entre capítulos ni rangos al revés', () => {
    expect(passages('Juan 5:30–6:10; Isaías 4–3; Juan 3:16-3:18')).toEqual([[], [], ['JHN.3.16-18']]);
  });

  it('sin referencias no devuelve nada', () => {
    expect(parseBibleReferences(undefined)).toEqual([]);
    expect(parseBibleReferences(' ; ')).toEqual([]);
  });
});
