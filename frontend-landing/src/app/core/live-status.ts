import { LiveEventItem, ServiceScheduleItem } from './church-api.service';

/** La iglesia transmite en hora de Colombia; el cálculo no depende de la zona del visitante. */
export const CHURCH_TIME_ZONE = 'America/Bogota';
const DEFAULT_DURATION_MINUTES = 120;
const DAYS_AHEAD = 8;

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAY_INDEX: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};
const EVERY_DAY = 'todos los dias';

export interface ChurchClock {
  year: number;
  month: number;
  day: number;
  /** Minutos desde la medianoche en Colombia. */
  minutes: number;
}

export interface LiveOccurrence {
  id: string;
  /** 0 = hoy, 1 = mañana… */
  dayOffset: number;
  weekday: number;
  date: Date;
  start: number;
  duration: number;
  title: string;
  url: string;
  special: boolean;
}

export interface ScheduleRow {
  id: string;
  day: string;
  note: string;
  time: string;
  streamed: boolean;
  liveNow: boolean;
}

export interface SpecialRow {
  id: string;
  title: string;
  when: string;
  liveNow: boolean;
}

export interface LiveStatus {
  live: LiveOccurrence | null;
  next: LiveOccurrence | null;
  /** "Hoy 7:00 p.m. · Servicio del miércoles" */
  nextLabel: string | null;
  rows: ScheduleRow[];
  specialRows: SpecialRow[];
}

export function churchClock(now: Date): ChurchClock {
  const parts: Record<string, string> = {};
  new Intl.DateTimeFormat('en-CA', {
    timeZone: CHURCH_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now).forEach((p) => (parts[p.type] = p.value));
  return {
    year: +parts['year'],
    month: +parts['month'],
    day: +parts['day'],
    minutes: (+parts['hour'] % 24) * 60 + +parts['minute'],
  };
}

/** Acepta "7:00 p.m.", "8:30 a.m.", "7 pm", "7pm", "19:00" y "19h". Devuelve minutos o null si no la entiende. */
export function parseTime(text: string | null | undefined): number | null {
  const match = /^\s*(\d{1,2})(?:[:.h](\d{2}))?\s*(?:h\s*)?([ap])?\.?\s*(?:m\.?)?\s*$/i.exec(text ?? '');
  if (!match) {
    return null;
  }
  let hours = +match[1];
  const minutes = match[2] ? +match[2] : 0;
  const meridiem = match[3]?.toLowerCase();
  if (minutes > 59 || hours > 23 || (meridiem && (hours < 1 || hours > 12))) {
    return null;
  }
  if (meridiem === 'a' && hours === 12) {
    hours = 0;
  } else if (meridiem === 'p' && hours !== 12) {
    hours += 12;
  }
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hours % 12 || 12}:${mm} ${hours < 12 ? 'a.m.' : 'p.m.'}`;
}

function normalizeDay(day: string): string {
  return day.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

function occursOn(day: string, weekday: number): boolean {
  const normalized = normalizeDay(day);
  return normalized === EVERY_DAY || DAY_INDEX[normalized] === weekday;
}

function serviceTitle(day: string): string {
  return normalizeDay(day) === EVERY_DAY ? 'Devocional diario' : `Servicio del ${day.trim().toLowerCase()}`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function whenLabel(o: LiveOccurrence, withDate: boolean): string {
  if (o.dayOffset === 0) return 'Hoy';
  if (o.dayOffset === 1) return 'Mañana';
  const name = DAY_NAMES[o.weekday];
  return withDate ? `${name} ${o.date.getUTCDate()} ${MONTHS[o.date.getUTCMonth()]}` : name;
}

/**
 * Qué se está transmitiendo ahora y qué sigue. Solo cuentan los horarios con `streamed` y las
 * transmisiones especiales; si coinciden, gana la especial. Los horarios cuya hora no se entiende
 * nunca se marcan en vivo.
 */
export function computeLiveStatus(
  services: ServiceScheduleItem[],
  liveEvents: LiveEventItem[],
  clock: ChurchClock,
  defaultUrl: string,
): LiveStatus {
  const base = Date.UTC(clock.year, clock.month - 1, clock.day);
  const occurrences: LiveOccurrence[] = [];

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const date = new Date(base + dayOffset * 86_400_000);
    const weekday = date.getUTCDay();
    const iso = isoDate(date);

    for (const event of liveEvents) {
      const start = event.active && event.date === iso ? parseTime(event.startTime) : null;
      if (start !== null) {
        occurrences.push({
          id: `special-${event.id}`, dayOffset, weekday, date, start, duration: event.durationMinutes,
          title: event.title, url: event.url || defaultUrl, special: true,
        });
      }
    }
    for (const service of services) {
      const start = service.streamed && occursOn(service.day, weekday) ? parseTime(service.time) : null;
      if (start !== null) {
        occurrences.push({
          id: service.id, dayOffset, weekday, date, start,
          duration: service.durationMinutes || DEFAULT_DURATION_MINUTES,
          title: serviceTitle(service.day), url: defaultUrl, special: false,
        });
      }
    }
  }

  occurrences.sort((a, b) => a.dayOffset - b.dayOffset || a.start - b.start || Number(b.special) - Number(a.special));

  const live = occurrences
    .filter((o) => o.dayOffset === 0 && clock.minutes >= o.start && clock.minutes < o.start + o.duration)
    .sort((a, b) => Number(b.special) - Number(a.special))[0] ?? null;
  const next = occurrences.find((o) => o !== live && (o.dayOffset > 0 || o.start > clock.minutes)) ?? null;

  const rows: ScheduleRow[] = services.map((s) => ({
    id: s.id,
    day: s.day,
    note: s.note,
    time: s.time,
    streamed: s.streamed,
    liveNow: !!live && !live.special && live.id === s.id,
  }));

  const specialRows: SpecialRow[] = occurrences
    .filter((o) => o.special && (o.dayOffset > 0 || o.start + o.duration > clock.minutes))
    .map((o) => ({
      id: o.id,
      title: o.title,
      when: `${whenLabel(o, true)} · ${formatTime(o.start)}`,
      liveNow: live?.id === o.id,
    }));

  return {
    live,
    next,
    nextLabel: next ? `${whenLabel(next, false)} ${formatTime(next.start)} · ${next.title}` : null,
    rows,
    specialRows,
  };
}
