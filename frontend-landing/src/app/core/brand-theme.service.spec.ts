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
    for (const variable of ['--brand-primary', '--brand-secondary', '--brand-tertiary']) {
      root.style.removeProperty(variable);
    }
    TestBed.resetTestingModule();
  });

  it('en el navegador aplica los colores guardados como variables CSS', () => {
    const { service, http, root } = setup('browser');

    service.load();
    http.expectOne(`${environment.apiUrl}/site-settings`).flush({
      liveBannerVisible: true,
      primaryColor: '#1b6ff8',
      secondaryColor: '#111111',
      tertiaryColor: '#fafafa',
    });

    expect(root.style.getPropertyValue('--brand-primary')).toBe('#1b6ff8');
    expect(root.style.getPropertyValue('--brand-secondary')).toBe('#111111');
    expect(root.style.getPropertyValue('--brand-tertiary')).toBe('#fafafa');
    http.verify();
  });

  it('ignora valores que no son #RRGGBB y deja los de styles.css', () => {
    const { service, root } = setup('browser');

    service.apply({ liveBannerVisible: true, primaryColor: 'naranja', secondaryColor: '#fff' });

    expect(root.style.getPropertyValue('--brand-primary')).toBe('');
    expect(root.style.getPropertyValue('--brand-secondary')).toBe('');
  });

  it('en el servidor no consulta el API', () => {
    const { service, http } = setup('server');

    service.load();

    http.expectNone(`${environment.apiUrl}/site-settings`);
    http.verify();
  });
});
