import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BIBLE_APP_KEY, BIBLE_SDK_LOADER, BibleApiService, MissingAttributionError } from './bible-api.service';

const versions = [
  { id: 3365, abbreviation: 'spaPdDpt', localized_abbreviation: 'PdDpt', title: 'Spanish Bible', localized_title: 'Palabra de Dios para ti' },
  { id: 1, abbreviation: 'PDT', localized_abbreviation: 'PDT', title: 'PDT', localized_title: 'Palabra de Dios para Todos' },
  { id: 2, abbreviation: 'NTV', localized_abbreviation: 'NTV', title: 'NTV', localized_title: 'Nueva Traducción Viviente' },
];

function setup({ appKey = 'key', platform = 'browser' } = {}) {
  const client = {
    getVersions: vi.fn().mockResolvedValue({ data: versions }),
    getPassageDisplay: vi.fn().mockResolvedValue({ html: '<div>texto</div>', attribution: { text: ' © NTV ' } }),
  };
  const loader = vi.fn().mockResolvedValue({
    ApiClient: class {},
    BibleClient: class {
      constructor() {
        return client;
      }
    },
  });
  TestBed.configureTestingModule({
    providers: [
      { provide: BIBLE_SDK_LOADER, useValue: loader },
      { provide: BIBLE_APP_KEY, useValue: appKey },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });
  return { service: TestBed.inject(BibleApiService), client, loader };
}

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void items.set(key, value)),
  };
}

describe('BibleApiService', () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('sin App Key queda deshabilitado y no carga el SDK', () => {
    const { service, loader } = setup({ appKey: '' });

    expect(service.isEnabled).toBe(false);
    expect(loader).not.toHaveBeenCalled();
  });

  it('lista las versiones en español con su abreviatura local una sola vez', async () => {
    const { service, client } = setup();

    const list = await service.listSpanishVersions();
    await service.listSpanishVersions();

    expect(client.getVersions).toHaveBeenCalledOnce();
    expect(client.getVersions).toHaveBeenCalledWith('es', undefined, { page_size: 99 });
    expect(list[0]).toEqual({ id: 3365, abbreviation: 'PdDpt', title: 'Palabra de Dios para ti' });
  });

  it('oculta las versiones que la plataforma lista pero no se pueden leer (GlossSP y RVES)', async () => {
    const { service, client } = setup();
    client.getVersions.mockResolvedValue({
      data: [{ id: 4212, abbreviation: 'GlossSP', title: 'Gloss Spanish' }, { id: 147, abbreviation: 'RVES', title: 'Reina-Valera Antigua' }, ...versions],
    });

    expect((await service.listSpanishVersions()).map((v) => v.id)).toEqual([3365, 1, 2]);
  });

  it('prefiere NTV, luego PDT y luego la primera', async () => {
    const { service } = setup();
    const list = await service.listSpanishVersions();

    expect(service.preferredVersion(list)?.abbreviation).toBe('NTV');
    expect(service.preferredVersion(list.filter((v) => v.abbreviation !== 'NTV'))?.abbreviation).toBe('PDT');
    expect(service.preferredVersion([list[0]])?.abbreviation).toBe('PdDpt');
    expect(service.preferredVersion([])).toBeNull();
  });

  it('usa la versión recordada y la ignora si ya no está disponible', async () => {
    const { service } = setup();
    const list = await service.listSpanishVersions();

    service.rememberVersion(1);
    expect(service.preferredVersion(list)?.abbreviation).toBe('PDT');

    service.rememberVersion(999);
    expect(service.preferredVersion(list)?.abbreviation).toBe('NTV');
  });

  it('un storage que lanza no rompe el servicio', async () => {
    const { service } = setup();
    storage.getItem.mockImplementation(() => {
      throw new Error('blocked');
    });
    storage.setItem.mockImplementation(() => {
      throw new Error('blocked');
    });
    const list = await service.listSpanishVersions();

    expect(() => service.rememberVersion(1)).not.toThrow();
    expect(service.preferredVersion(list)?.abbreviation).toBe('NTV');
  });

  it('devuelve el HTML y la atribución del pasaje', async () => {
    const { service, client } = setup();

    await expect(service.getPassage(2, 'GAL.6')).resolves.toEqual({ html: '<div>texto</div>', attribution: '© NTV' });
    expect(client.getPassageDisplay).toHaveBeenCalledWith({ versionId: 2, passageId: 'GAL.6', includeHeadings: true });
  });

  it('rechaza un pasaje sin atribución y retira esa versión de la lista', async () => {
    const { service, client } = setup();
    client.getPassageDisplay.mockRejectedValueOnce(Object.assign(new Error('no attribution'), { code: 'missing_passage_attribution' }));

    await expect(service.getPassage(2, 'GAL.6')).rejects.toBeInstanceOf(MissingAttributionError);
    expect((await service.listSpanishVersions()).map((v) => v.id)).toEqual([3365, 1]);

    client.getPassageDisplay.mockResolvedValueOnce({ html: '<div/>', attribution: { text: '  ' } });
    await expect(service.getPassage(1, 'GAL.6')).rejects.toBeInstanceOf(MissingAttributionError);
  });

  it('si falla la lista de versiones, reintenta en la siguiente llamada', async () => {
    const { service, client } = setup();
    client.getVersions.mockRejectedValueOnce(new Error('offline'));

    await expect(service.listSpanishVersions()).rejects.toThrow('offline');
    await expect(service.listSpanishVersions()).resolves.toHaveLength(3);
  });

  it('en el servidor no toca localStorage', () => {
    const { service } = setup({ platform: 'server' });
    service.rememberVersion(1);

    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
