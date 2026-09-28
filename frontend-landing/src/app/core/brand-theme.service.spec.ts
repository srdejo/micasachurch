import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { BrandThemeService } from './brand-theme.service';
import { environment } from '../../environments/environment';

function setup(platform: 'browser' | 'server') {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: platform }],
  });
  return {
    service: TestBed.inject(BrandThemeService),
    http: TestBed.inject(HttpTestingController),
    root: TestBed.inject(DOCUMENT).documentElement,
  };
}

describe('BrandThemeService', () => {
  afterEach(() => {
    const root = document.documentElement;
    for (const variable of ['--accent', '--accent-deep', '--accent-soft']) {
      root.style.removeProperty(variable);
    }
    TestBed.resetTestingModule();
  });

  it('en el navegador aplica los colores del tema activo como variables CSS', () => {
    const { service, http, root } = setup('browser');

    service.load();
    http.expectOne(`${environment.apiUrl}/site-settings`).flush({
      liveBannerVisible: true,
      activeTheme: 'Coral',
      accentColor: '#ff6b35',
      deepColor: '#b23a0f',
      softColor: '#ffe6da',
    });

    expect(root.style.getPropertyValue('--accent')).toBe('#ff6b35');
    expect(root.style.getPropertyValue('--accent-deep')).toBe('#b23a0f');
    expect(root.style.getPropertyValue('--accent-soft')).toBe('#ffe6da');
    http.verify();
  });

  it('ignora valores que no son #RRGGBB y deja los de styles.css', () => {
    const { service, root } = setup('browser');

    service.apply({ liveBannerVisible: true, accentColor: 'naranja', deepColor: '#fff' });

    expect(root.style.getPropertyValue('--accent')).toBe('');
    expect(root.style.getPropertyValue('--accent-deep')).toBe('');
  });

  it('en el servidor no consulta el API', () => {
    const { service, http } = setup('server');

    service.load();

    http.expectNone(`${environment.apiUrl}/site-settings`);
    http.verify();
  });
});
