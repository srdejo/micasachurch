import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AudioPlayer } from './audio-player';

function setup(variant: 'dark' | 'light' = 'dark') {
  const fixture = TestBed.createComponent(AudioPlayer);
  fixture.componentRef.setInput('src', 'https://example.com/lectura.mp3');
  fixture.componentRef.setInput('variant', variant);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const audio = el.querySelector('audio') as HTMLAudioElement;
  // jsdom no reproduce audio: se simulan play/pause y los eventos que emitiría el navegador.
  let paused = true;
  Object.defineProperty(audio, 'paused', { get: () => paused });
  Object.defineProperty(audio, 'duration', { value: 240, configurable: true });
  audio.play = vi.fn(() => { paused = false; audio.dispatchEvent(new Event('play')); return Promise.resolve(); });
  audio.pause = vi.fn(() => { paused = true; audio.dispatchEvent(new Event('pause')); });
  audio.dispatchEvent(new Event('loadedmetadata'));
  fixture.detectChanges();
  return { fixture, el, audio };
}

describe('AudioPlayer', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('alterna reproducir y pausar con etiquetas en español', () => {
    const { fixture, el, audio } = setup();
    const button = () => el.querySelector('button[aria-label$="la lectura"]') as HTMLButtonElement;

    expect(button().getAttribute('aria-label')).toBe('Reproducir la lectura');
    button().click();
    fixture.detectChanges();
    expect(audio.play).toHaveBeenCalled();
    expect(button().getAttribute('aria-label')).toBe('Pausar la lectura');

    button().click();
    fixture.detectChanges();
    expect(audio.pause).toHaveBeenCalled();
    expect(button().getAttribute('aria-label')).toBe('Reproducir la lectura');
  });

  it('mover la barra adelanta el audio y actualiza el tiempo', () => {
    const { fixture, el, audio } = setup();
    const range = el.querySelector('input[type="range"]') as HTMLInputElement;

    expect(el.textContent).toContain('0:00 / 4:00');
    range.value = '120';
    range.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(audio.currentTime).toBe(120);
    expect(el.textContent).toContain('2:00 / 4:00');
    expect(range.getAttribute('aria-label')).toBe('Posición del audio');
  });

  it('la velocidad pasa por 1×, 1.25× y 1.5×', () => {
    const { fixture, el, audio } = setup();
    const speed = el.querySelector('button[aria-label="Velocidad de reproducción"]') as HTMLButtonElement;

    expect(speed.textContent?.trim()).toBe('1×');
    speed.click();
    fixture.detectChanges();
    expect(audio.playbackRate).toBe(1.25);
    speed.click();
    fixture.detectChanges();
    expect(speed.textContent?.trim()).toBe('1.5×');
    expect(audio.playbackRate).toBe(1.5);
    speed.click();
    expect(audio.playbackRate).toBe(1);
  });

  it('si el audio no carga, no se muestra nada', () => {
    const { fixture, el, audio } = setup();

    audio.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(el.querySelector('button')).toBeNull();
    expect(el.textContent).not.toContain('Escucha la lectura');
  });

  it('la variante clara usa tinta sobre fondo claro', () => {
    const { el } = setup('light');

    expect(el.querySelector('div')!.className).toContain('text-ink');
    expect(el.querySelector('input[type="range"]')!.className).toContain('audio-range-light');
  });
});
