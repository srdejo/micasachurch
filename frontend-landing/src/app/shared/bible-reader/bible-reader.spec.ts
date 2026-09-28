import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BibleApiService, MissingAttributionError } from '../../core/bible-api.service';
import { BibleReference } from '../../core/bible-reference';
import { BibleReader } from './bible-reader';

const references: BibleReference[] = [
  { label: 'Isaías 3–4', passages: ['ISA.3', 'ISA.4'] },
  { label: 'Gálatas 6', passages: ['GAL.6'] },
];
const versions = [
  { id: 3365, abbreviation: 'PdDpt', title: 'Palabra de Dios para ti' },
  { id: 3291, abbreviation: 'VBL', title: 'Versión Biblia Libre' },
];

function fakeApi() {
  return {
    listSpanishVersions: vi.fn().mockResolvedValue(versions),
    preferredVersion: vi.fn((list: typeof versions) => list[0] ?? null),
    rememberVersion: vi.fn(),
    getPassage: vi.fn((versionId: number, passage: string) =>
      Promise.resolve({ html: `<span class="yv-v">${passage}@${versionId}</span><b>negrita</b>`, attribution: `<i>© ${versionId}</i>` }),
    ),
  };
}

async function setup({ refs = references, initialIndex = 0, api = fakeApi() } = {}) {
  TestBed.configureTestingModule({ providers: [{ provide: BibleApiService, useValue: api }] });
  const fixture = TestBed.createComponent(BibleReader);
  fixture.componentRef.setInput('references', refs);
  fixture.componentRef.setInput('initialIndex', initialIndex);
  const closed = vi.fn();
  fixture.componentInstance.close.subscribe(closed);
  fixture.detectChanges();
  await settle(fixture);
  return { fixture, el: fixture.nativeElement as HTMLElement, api, closed };
}

async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
  for (let i = 0; i < 5; i++) await Promise.resolve();
  await fixture.whenStable();
  fixture.detectChanges();
}

const tabs = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

describe('BibleReader', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('abre en la referencia inicial, con un capítulo tras otro y la atribución como texto', async () => {
    const { el, api } = await setup();
    const dialog = el.querySelector('[role="dialog"]')!;

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Lectura: Isaías 3–4');
    expect(tabs(el)[0].getAttribute('aria-selected')).toBe('true');
    expect(api.getPassage.mock.calls).toEqual([
      [3365, 'ISA.3'],
      [3365, 'ISA.4'],
    ]);
    expect([...el.querySelectorAll('h3')].map((h) => h.textContent?.trim())).toEqual(['Capítulo 3', 'Capítulo 4']);
    expect(el.querySelector('[data-testid="bible-passage"] .yv-v')?.textContent).toBe('ISA.3@3365');
    const attribution = el.querySelector('[data-testid="bible-attribution"]')!;
    expect(attribution.textContent).toBe('<i>© 3365</i>');
    expect(attribution.querySelector('i')).toBeNull();
  });

  it('al cambiar de pestaña pide la otra referencia sin cerrarse', async () => {
    const { fixture, el, api, closed } = await setup();

    tabs(el)[1].click();
    await settle(fixture);

    expect(api.getPassage).toHaveBeenLastCalledWith(3365, 'GAL.6');
    expect(tabs(el)[1].getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('h2')?.textContent).toContain('Gálatas 6');
    expect(el.querySelectorAll('h3').length).toBe(0);
    expect(closed).not.toHaveBeenCalled();
  });

  it('al cambiar de versión recarga el pasaje activo y guarda la preferencia', async () => {
    const { fixture, el, api } = await setup({ initialIndex: 1 });
    const select = el.querySelector('select')!;

    expect([...select.options].map((o) => o.textContent?.trim())).toEqual([
      'PdDpt — Palabra de Dios para ti',
      'VBL — Versión Biblia Libre',
    ]);
    select.value = '3291';
    select.dispatchEvent(new Event('change'));
    await settle(fixture);

    expect(api.rememberVersion).toHaveBeenCalledWith(3291);
    expect(api.getPassage).toHaveBeenLastCalledWith(3291, 'GAL.6');
    expect(el.querySelector('[data-testid="bible-attribution"]')?.textContent).toContain('3291');
  });

  it('si falla muestra "Reintentar" y reintenta', async () => {
    const api = fakeApi();
    api.getPassage.mockRejectedValueOnce(new Error('offline'));
    const { fixture, el } = await setup({ refs: [references[1]], api });

    expect(el.textContent).toContain('No pudimos cargar este pasaje.');
    const retry = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Reintentar')!;
    retry.click();
    await settle(fixture);

    expect(el.textContent).not.toContain('No pudimos cargar este pasaje.');
    expect(el.querySelector('[data-testid="bible-passage"]')).not.toBeNull();
  });

  it('una versión sin atribución se descarta y se usa la siguiente', async () => {
    const api = fakeApi();
    api.getPassage.mockRejectedValueOnce(new MissingAttributionError());
    api.listSpanishVersions.mockResolvedValueOnce(versions).mockResolvedValue([versions[1]]);
    const { el } = await setup({ refs: [references[1]], api });

    expect(api.getPassage).toHaveBeenLastCalledWith(3291, 'GAL.6');
    expect(el.querySelector('select')!.options.length).toBe(1);
    expect(el.querySelector('[data-testid="bible-attribution"]')?.textContent).toContain('3291');
  });

  it('sin versiones utilizables muestra el error', async () => {
    const api = fakeApi();
    api.listSpanishVersions.mockResolvedValue([]);
    const { el } = await setup({ api });

    expect(el.textContent).toContain('No pudimos cargar este pasaje.');
    expect(api.getPassage).not.toHaveBeenCalled();
  });

  it('se cierra con Escape, con "Cerrar" y tocando fuera, pero no tocando dentro', async () => {
    const { el, closed } = await setup();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toHaveBeenCalledTimes(1);

    el.querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click();
    expect(closed).toHaveBeenCalledTimes(2);

    el.querySelector<HTMLElement>('[role="dialog"]')!.click();
    expect(closed).toHaveBeenCalledTimes(2);

    el.querySelector<HTMLElement>('[role="dialog"]')!.parentElement!.click();
    expect(closed).toHaveBeenCalledTimes(3);
  });

  it('con una sola referencia no muestra pestañas', async () => {
    const { el } = await setup({ refs: [references[1]] });

    expect(tabs(el).length).toBe(0);
  });

  it('el foco no sale del lector con Tab', async () => {
    const { fixture, el } = await setup();
    document.body.appendChild(el);
    const focusable = [...el.querySelectorAll<HTMLElement>('button, select')];
    const last = focusable[focusable.length - 1];
    last.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    last.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(focusable[0]);
    fixture.destroy();
    el.remove();
  });
});
