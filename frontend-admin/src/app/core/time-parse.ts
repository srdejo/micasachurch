/**
 * Copia de `parseTime` de frontend-landing/src/app/core/live-status.ts: el panel la usa para avisar
 * cuando una hora no la va a entender el sitio (y ese horario nunca se marcaría "En vivo").
 * Si cambia una, hay que cambiar la otra.
 */
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
