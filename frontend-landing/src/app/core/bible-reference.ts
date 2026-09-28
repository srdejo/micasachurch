export interface BibleReference {
  label: string;
  /** One USFM passage id per chapter; empty when the reference can't be read. */
  passages: string[];
}

const BOOKS: Record<string, string> = {
  genesis: 'GEN',
  exodo: 'EXO',
  levitico: 'LEV',
  numeros: 'NUM',
  deuteronomio: 'DEU',
  josue: 'JOS',
  jueces: 'JDG',
  rut: 'RUT',
  '1 samuel': '1SA',
  '2 samuel': '2SA',
  '1 reyes': '1KI',
  '2 reyes': '2KI',
  '1 cronicas': '1CH',
  '2 cronicas': '2CH',
  esdras: 'EZR',
  nehemias: 'NEH',
  ester: 'EST',
  job: 'JOB',
  salmo: 'PSA',
  salmos: 'PSA',
  proverbios: 'PRO',
  eclesiastes: 'ECC',
  cantares: 'SNG',
  'cantar de los cantares': 'SNG',
  isaias: 'ISA',
  jeremias: 'JER',
  lamentaciones: 'LAM',
  ezequiel: 'EZK',
  daniel: 'DAN',
  oseas: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  abdias: 'OBA',
  jonas: 'JON',
  miqueas: 'MIC',
  nahum: 'NAM',
  habacuc: 'HAB',
  sofonias: 'ZEP',
  hageo: 'HAG',
  zacarias: 'ZEC',
  malaquias: 'MAL',
  mateo: 'MAT',
  marcos: 'MRK',
  lucas: 'LUK',
  juan: 'JHN',
  hechos: 'ACT',
  'hechos de los apostoles': 'ACT',
  romanos: 'ROM',
  '1 corintios': '1CO',
  '2 corintios': '2CO',
  galatas: 'GAL',
  efesios: 'EPH',
  filipenses: 'PHP',
  colosenses: 'COL',
  '1 tesalonicenses': '1TH',
  '2 tesalonicenses': '2TH',
  '1 timoteo': '1TI',
  '2 timoteo': '2TI',
  tito: 'TIT',
  filemon: 'PHM',
  hebreos: 'HEB',
  santiago: 'JAS',
  '1 pedro': '1PE',
  '2 pedro': '2PE',
  '1 juan': '1JN',
  '2 juan': '2JN',
  '3 juan': '3JN',
  judas: 'JUD',
  apocalipsis: 'REV',
};

const REFERENCE = /^((?:[123] )?[a-z]+(?: [a-z]+)*) (\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s*([-:])\s*/g, '$1')
    .replace(/\./g, '')
    .replace(/^([123])\s*/, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPassages(text: string): string[] {
  const match = REFERENCE.exec(normalize(text));
  const book = match && BOOKS[match[1]];
  if (!match || !book) return [];

  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : null;
  const rangeEnd = match[4] ? Number(match[4]) : null;
  const rangeEndVerse = match[5] ? Number(match[5]) : null;

  if (verse === null) {
    if (rangeEndVerse !== null) return [];
    if (rangeEnd === null) return [`${book}.${chapter}`];
    if (rangeEnd < chapter) return [];
    return Array.from({ length: rangeEnd - chapter + 1 }, (_, i) => `${book}.${chapter + i}`);
  }
  if (rangeEnd === null) return [`${book}.${chapter}.${verse}`];
  if (rangeEndVerse === null) return rangeEnd > verse ? [`${book}.${chapter}.${verse}-${rangeEnd}`] : [];
  // The passages API rejects ranges that cross chapters, and without verse counts we can't split them.
  return rangeEnd === chapter && rangeEndVerse > verse ? [`${book}.${chapter}.${verse}-${rangeEndVerse}`] : [];
}

export function parseBibleReferences(text: string | null | undefined): BibleReference[] {
  return (text ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label) => ({ label, passages: toPassages(label) }));
}
