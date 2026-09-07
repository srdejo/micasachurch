import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ChurchApiService } from './church-api.service';
import { environment } from '../../environments/environment';

describe('ChurchApiService', () => {
  let service: ChurchApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ChurchApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('cada consulta pública pega en su ruta del API', () => {
    const rutas: [() => void, string][] = [
      [() => service.getEvents().subscribe(), '/events'],
      [() => service.getServices().subscribe(), '/services'],
      [() => service.getNetworks().subscribe(), '/networks'],
      [() => service.getLinks().subscribe(), '/links'],
      [() => service.getSiteSettings().subscribe(), '/site-settings'],
      [() => service.getMinistries().subscribe(), '/ministries'],
      [() => service.getSiteContent().subscribe(), '/site-content'],
    ];

    for (const [llamar, ruta] of rutas) {
      llamar();
      const req = http.expectOne(`${environment.apiUrl}${ruta}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    }

    http.verify();
  });

  it('la petición de oración va por POST con el cuerpo tal cual', () => {
    const payload = { name: 'Ana', message: 'Oren por mi familia' };

    service.submitPrayerRequest(payload).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/prayer-requests`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1' });
    http.verify();
  });

  it('imageUrl arma la URL del slot sin pegarle al API', () => {
    expect(service.imageUrl('hero')).toBe(`${environment.apiUrl}/images/hero`);
    http.verify();
  });
});
