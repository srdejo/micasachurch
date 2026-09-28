import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LiveStatus } from '../../core/live-status';
import { ScheduleModal } from './schedule-modal';

const status: LiveStatus = {
  live: null,
  next: null,
  nextLabel: null,
  rows: [
    { id: 'devo', day: 'Todos los días', note: 'Devocional diario en vivo', time: '7:00 a.m.', streamed: true, liveNow: true },
    { id: 'mie', day: 'Miércoles', note: '', time: '7:00 p.m.', streamed: false, liveNow: false },
  ],
  specialRows: [{ id: 's', title: 'Bautizos', when: 'Mañana · 7:00 p.m.', liveNow: false }],
};

function setup() {
  const fixture = TestBed.createComponent(ScheduleModal);
  fixture.componentRef.setInput('status', status);
  fixture.componentRef.setInput('mapsUrl', 'https://maps.example');
  fixture.componentRef.setInput('whatsappUrl', 'https://wa.me/1');
  const closed = vi.fn();
  fixture.componentInstance.close.subscribe(closed);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, closed };
}

describe('ScheduleModal', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('es un diálogo modal accesible', () => {
    const { el } = setup();
    const dialog = el.querySelector('[role="dialog"]')!;

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(el.textContent).toContain('● En vivo ahora');
    expect(el.textContent).toContain('Presencial');
    expect(el.textContent).toContain('Mañana · 7:00 p.m.');
  });

  it('se cierra con Escape, con ✕ y con un clic fuera, pero no con un clic dentro', () => {
    const { el, closed } = setup();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toHaveBeenCalledTimes(1);

    (el.querySelector('button[aria-label="Cerrar"]') as HTMLButtonElement).click();
    expect(closed).toHaveBeenCalledTimes(2);

    (el.querySelector('[role="dialog"]') as HTMLElement).click();
    expect(closed).toHaveBeenCalledTimes(2);

    (el.firstElementChild as HTMLElement).click();
    expect(closed).toHaveBeenCalledTimes(3);
  });
});
