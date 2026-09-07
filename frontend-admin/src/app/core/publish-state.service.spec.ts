import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublishStateService } from './publish-state.service';
import { environment } from '../../environments/environment';

describe('PublishStateService', () => {
  let service: PublishStateService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/admin/publish`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PublishStateService);
    http = TestBed.inject(HttpTestingController);
  });

  it('refresh actualiza el contador de pendientes', () => {
    service.refresh();

    http.expectOne(`${baseUrl}/pending`).flush({ pendingCount: 3 });

    expect(service.pendingCount()).toBe(3);
    http.verify();
  });

  it('refresh no rompe ni ensucia el estado si el backend falla', () => {
    service.pendingCount.set(5);

    service.refresh();
    http
      .expectOne(`${baseUrl}/pending`)
      .error(new ProgressEvent('error'), { status: 500 });

    expect(service.pendingCount()).toBe(5);
    expect(service.error()).toBeNull();
  });

  it('publish deja el contador en cero, marca la hora y avisa al llamador', () => {
    const antes = Date.now();
    const onDone = vi.fn();

    service.publish(onDone);
    expect(service.publishing()).toBe(true);

    http.expectOne(baseUrl).flush({ pendingCount: 0 });

    expect(service.publishing()).toBe(false);
    expect(service.pendingCount()).toBe(0);
    expect(service.publishedAt()).toBeGreaterThanOrEqual(antes);
    expect(service.error()).toBeNull();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('publish informa el error y no marca publicación cuando falla', () => {
    const onDone = vi.fn();

    service.publish(onDone);
    http.expectOne(baseUrl).error(new ProgressEvent('error'), { status: 401 });

    expect(service.publishing()).toBe(false);
    expect(service.error()).toBe(
      'No se pudieron publicar los cambios. Intenta de nuevo.',
    );
    expect(service.publishedAt()).toBe(0);
    expect(onDone).not.toHaveBeenCalled();
  });
});
