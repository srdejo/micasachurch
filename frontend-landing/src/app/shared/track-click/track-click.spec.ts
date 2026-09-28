import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../core/analytics.service';
import { TrackClick } from './track-click';

@Component({
  standalone: true,
  imports: [TrackClick],
  template: `
    <a href="https://example.com" target="_blank" appTrackClick="en_vivo" [trackParams]="{ origen: 'header' }">En vivo</a>
    <button type="button" appTrackClick="como_llegar" (click)="clicked = true">Cómo llegar</button>
  `,
})
class Host {
  clicked = false;
}

describe('TrackClick', () => {
  afterEach(() => TestBed.resetTestingModule());

  function setup() {
    const analytics = { track: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: AnalyticsService, useValue: analytics }] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, analytics };
  }

  it('envía el evento con sus parámetros y deja que el enlace se abra', () => {
    const { el, analytics } = setup();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    el.querySelector('a')!.dispatchEvent(event);

    expect(analytics.track).toHaveBeenCalledWith('en_vivo', { origen: 'header' });
    expect(event.defaultPrevented).toBe(false);
  });

  it('sin parámetros envía solo el nombre y el control sigue haciendo lo suyo', () => {
    const { fixture, el, analytics } = setup();

    el.querySelector('button')!.click();

    expect(analytics.track).toHaveBeenCalledWith('como_llegar', undefined);
    expect(fixture.componentInstance.clicked).toBe(true);
  });
});
