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
      [() => service.getBanners().subscribe(), '/banners'],
      [() => service.getLiveEvents().subscribe(), '/live-events'],
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

  it('bannerImageUrl versiona la URL y devuelve null si el banner no tiene imagen', () => {
    const banner = {
      id: '1', kicker: null, title: 'Mi casa es tu casa', text: null, ctaLabel: null, ctaHref: null,
      imageKey: 'banner-1', imageUpdatedAt: '2026-09-27T14:17:01Z', active: true, displayOrder: 1,
    };

    expect(service.bannerImageUrl(banner)).toBe(`${environment.apiUrl}/images/banner-1?v=2026-09-27T14%3A17%3A01Z`);
    expect(service.bannerImageUrl({ ...banner, imageKey: null })).toBeNull();
  });
});
