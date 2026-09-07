import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DevotionalApiService, DevotionalEntry } from './devotional-api.service';

const entrada: DevotionalEntry = {
  title: 'Título',
  passage_reference: 'Juan 1',
  verse: 'En el principio…',
  content: '<p>cuerpo</p>',
};

describe('DevotionalApiService', () => {
  let service: DevotionalApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DevotionalApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('pide la fecha en MM-DD-YYYY, con ceros a la izquierda', () => {
    service.getByDate(new Date(2026, 0, 5)).subscribe();

    const req = http.expectOne((r) => r.url.includes('/devotionals/v2'));
    expect(req.request.urlWithParams).toContain('on=01-05-2026');
    expect(req.request.urlWithParams).toContain('country=CO');
    expect(req.request.urlWithParams).toContain('status=publish');
    req.flush([entrada]);
    http.verify();
  });

  it('toma la primera entrada cuando la API devuelve un arreglo', () => {
    let recibido: DevotionalEntry | null | undefined;

    service.getByDate(new Date(2026, 8, 7)).subscribe((r) => (recibido = r));
    http.expectOne((r) => r.url.includes('/devotionals/v2')).flush([entrada]);

    expect(recibido).toEqual(entrada);
  });

  it('acepta también el objeto suelto que la API devuelve algunos días', () => {
    let recibido: DevotionalEntry | null | undefined;

    service.getByDate(new Date(2026, 8, 7)).subscribe((r) => (recibido = r));
    http.expectOne((r) => r.url.includes('/devotionals/v2')).flush(entrada);

    expect(recibido).toEqual(entrada);
  });

  it('devuelve null cuando no hay devocional para esa fecha', () => {
    let recibido: DevotionalEntry | null | undefined;

    service.getByDate(new Date(2026, 8, 7)).subscribe((r) => (recibido = r));
    http.expectOne((r) => r.url.includes('/devotionals/v2')).flush([]);

    expect(recibido).toBeNull();
  });
});
