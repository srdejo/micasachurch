import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroBannerItem } from '../../core/church-api.service';
import { HERO_ROTATION_MS, HeroCarousel } from './hero-carousel';

function banner(id: string, extra: Partial<HeroBannerItem> = {}): HeroBannerItem {
  return {
    id, kicker: null, title: `Banner ${id}`, text: null, ctaLabel: null, ctaHref: null,
    imageKey: null, imageUpdatedAt: null, active: true, displayOrder: +id, ...extra,
  };
}

function setup(banners: HeroBannerItem[]) {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  const fixture = TestBed.createComponent(HeroCarousel);
  fixture.componentRef.setInput('banners', banners);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

describe('HeroCarousel', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('avanza solo cada 6,5 s y vuelve al primero después del último', async () => {
    const { component, fixture } = setup([banner('1'), banner('2'), banner('3')]);
    await fixture.whenStable();

    vi.advanceTimersByTime(HERO_ROTATION_MS);
    expect(component.active()).toBe(1);
    vi.advanceTimersByTime(HERO_ROTATION_MS * 2);
    expect(component.active()).toBe(0);
  });

  it('no avanza mientras el mouse está encima ni con la pausa externa', async () => {
    const { component, fixture } = setup([banner('1'), banner('2')]);
    await fixture.whenStable();

    component.hovering.set(true);
    vi.advanceTimersByTime(HERO_ROTATION_MS * 3);
    expect(component.active()).toBe(0);

    component.hovering.set(false);
    fixture.componentRef.setInput('paused', true);
    vi.advanceTimersByTime(HERO_ROTATION_MS * 3);
    expect(component.active()).toBe(0);
  });

  it('sin banners activos muestra el banner por defecto', () => {
    const { el } = setup([banner('1', { active: false })]);

    expect(el.textContent).toContain('Mi casa es tu casa');
    expect(el.textContent).toContain('Ver horarios');
  });

  it('el botón con #horarios abre la ventana de horarios en vez de navegar', () => {
    const { component, el } = setup([banner('1', { ctaLabel: 'Ver horarios', ctaHref: '#horarios' })]);
    const opened = vi.fn();
    component.openSchedule.subscribe(opened);

    (el.querySelector('button[type="button"]') as HTMLButtonElement).click();

    expect(opened).toHaveBeenCalledOnce();
  });

  it('un deslizamiento de más de 40 px cambia de banner', () => {
    const { component } = setup([banner('1'), banner('2')]);
    const touch = (x: number) => ({ touches: [{ clientX: x }], changedTouches: [{ clientX: x }] }) as unknown as TouchEvent;

    component.onTouchStart(touch(200));
    component.onTouchEnd(touch(180));
    expect(component.active()).toBe(0);

    component.onTouchStart(touch(200));
    component.onTouchEnd(touch(120));
    expect(component.active()).toBe(1);
  });
});
