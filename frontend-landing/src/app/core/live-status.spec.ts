import { describe, expect, it } from 'vitest';

import { LiveEventItem, ServiceScheduleItem } from './church-api.service';
import { churchClock, computeLiveStatus, formatTime, parseTime } from './live-status';

const FACEBOOK = 'https://www.facebook.com/micasachurchocana';

function service(day: string, time: string, streamed = true, durationMinutes = 120, id = `${day}-${time}`): ServiceScheduleItem {
  return { id, day, time, note: '', streamed, displayOrder: 0, durationMinutes };
}

const devotional = service('Todos los días', '7:00 a.m.', true, 45, 'devo');
const wednesday = service('Miércoles', '7:00 p.m.', true, 120, 'mie');
const sunday = service('Domingo', '8:30 a.m.', true, 90, 'dom1');

/** 2026-09-30 es miércoles. */
function at(isoInBogota: string) {
  return churchClock(new Date(`${isoInBogota}-05:00`));
}

describe('parseTime', () => {
  it('entiende los formatos que escribe la iglesia', () => {
    expect(parseTime('7:00 p.m.')).toBe(19 * 60);
    expect(parseTime('8:30 a.m.')).toBe(8 * 60 + 30);
    expect(parseTime('7 pm')).toBe(19 * 60);
    expect(parseTime('7pm')).toBe(19 * 60);
    expect(parseTime('19:00')).toBe(19 * 60);
    expect(parseTime('12:00 p.m.')).toBe(12 * 60);
    expect(parseTime('12:15 a.m.')).toBe(15);
  });

  it('devuelve null si no es una hora', () => {
    for (const text of ['por la noche', '', '25:00', '13 p.m.', '7:75 a.m.']) {
      expect(parseTime(text)).toBeNull();
    }
  });

  it('formatTime escribe como en el sitio', () => {
    expect(formatTime(19 * 60)).toBe('7:00 p.m.');
    expect(formatTime(8 * 60 + 30)).toBe('8:30 a.m.');
  });
});

describe('computeLiveStatus', () => {
  it('durante el devocional diario lo marca en vivo', () => {
    const status = computeLiveStatus([devotional, wednesday], [], at('2026-09-30T07:10:00'), FACEBOOK);

    expect(status.live?.title).toBe('Devocional diario');
    expect(status.live?.url).toBe(FACEBOOK);
    expect(status.rows.find((r) => r.id === 'devo')?.liveNow).toBe(true);
  });

  it('fuera de transmisión anuncia la próxima', () => {
    const status = computeLiveStatus([devotional, wednesday], [], at('2026-09-30T15:00:00'), FACEBOOK);

    expect(status.live).toBeNull();
    expect(status.nextLabel).toBe('Hoy 7:00 p.m. · Servicio del miércoles');
  });

  it('la duración define cuándo termina', () => {
    expect(computeLiveStatus([devotional], [], at('2026-09-30T07:44:00'), FACEBOOK).live).not.toBeNull();
    expect(computeLiveStatus([devotional], [], at('2026-09-30T07:45:00'), FACEBOOK).live).toBeNull();
    // 2026-10-04 es domingo: 8:30 a 10:00 con 90 minutos.
    expect(computeLiveStatus([sunday], [], at('2026-10-04T09:59:00'), FACEBOOK).live?.id).toBe('dom1');
    expect(computeLiveStatus([sunday], [], at('2026-10-04T10:00:00'), FACEBOOK).live).toBeNull();
  });

  it('los horarios no transmitidos nunca se marcan en vivo', () => {
    const inPerson = service('Miércoles', '7:00 p.m.', false, 120, 'presencial');
    expect(computeLiveStatus([inPerson], [], at('2026-09-30T19:30:00'), FACEBOOK).live).toBeNull();
  });

  it('una transmisión especial tiene prioridad y usa su enlace', () => {
    const special: LiveEventItem = {
      id: 'x', title: 'Noche de alabanza', date: '2026-09-30', startTime: '19:00', durationMinutes: 120,
      url: 'https://youtube.com/live/abc', active: true,
    };
    const status = computeLiveStatus([wednesday], [special], at('2026-09-30T19:10:00'), FACEBOOK);

    expect(status.live?.title).toBe('Noche de alabanza');
    expect(status.live?.url).toBe('https://youtube.com/live/abc');
    expect(status.rows.find((r) => r.id === 'mie')?.liveNow).toBe(false);
    expect(status.specialRows[0]).toMatchObject({ title: 'Noche de alabanza', when: 'Hoy · 7:00 p.m.', liveNow: true });
  });

  it('lista las especiales de los próximos días con su fecha', () => {
    const tomorrow: LiveEventItem = {
      id: 'y', title: 'Bautizos', date: '2026-10-01', startTime: '19:00', durationMinutes: 60, url: FACEBOOK, active: true,
    };
    const saturday: LiveEventItem = { ...tomorrow, id: 'z', title: 'Conferencia', date: '2026-10-03' };
    const inactive: LiveEventItem = { ...tomorrow, id: 'w', title: 'Oculta', active: false };

    const status = computeLiveStatus([], [tomorrow, saturday, inactive], at('2026-09-30T12:00:00'), FACEBOOK);

    expect(status.specialRows.map((r) => r.when)).toEqual(['Mañana · 7:00 p.m.', 'Sábado 3 oct · 7:00 p.m.']);
  });

  it('una hora que no se entiende no rompe el cálculo', () => {
    const broken = service('Miércoles', 'por la noche', true, 120, 'roto');
    const status = computeLiveStatus([broken, devotional], [], at('2026-09-30T07:10:00'), FACEBOOK);

    expect(status.live?.id).toBe('devo');
  });

  it('usa la hora de Colombia aunque el visitante esté en otra zona', () => {
    // 14:10 en Madrid (UTC+2 en verano) son las 7:10 a.m. en Bogotá.
    const clock = churchClock(new Date('2026-09-30T14:10:00+02:00'));

    expect(clock.minutes).toBe(7 * 60 + 10);
    expect(computeLiveStatus([devotional], [], clock, FACEBOOK).live?.title).toBe('Devocional diario');
  });
});
