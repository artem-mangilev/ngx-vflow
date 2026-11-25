import { effect } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { dispatchPointer, pointerDrag } from '../../gestures/pointer-events.testing';
import { ViewportState } from '../../interfaces/viewport.interface';

describe('programmatic viewport API', () => {
  let fixture: ComponentFixture<VflowComponent> | undefined;
  let flow: VflowComponent;
  let pane: HTMLElement;

  /** Renders an empty 400 x 300 flow with real timers, then mocks the clock that animations run on. */
  async function setup() {
    TestBed.configureTestingModule({ imports: [VflowComponent] });
    fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.detectChanges();
    await fixture.whenStable();
    flow = fixture.componentInstance;
    pane = fixture.nativeElement.querySelector('.v-pane');
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    });
  }

  afterEach(() => {
    if (!fixture) return;
    vi.runAllTimers();
    vi.useRealTimers();
    fixture = undefined;
  });

  function changeEnds() {
    const ends: ViewportState[] = [];
    flow.viewportChangeEnd.subscribe((state) => ends.push(state));
    return ends;
  }

  describe('limits and anchors', () => {
    it('zooms around the pane center', async () => {
      await setup();
      flow.zoomTo(2);
      expect(flow.viewport()).toEqual({ x: -200, y: -150, zoom: 2 });
    });

    it('keeps zoomTo within the maximum zoom', async () => {
      await setup();
      flow.zoomTo(10);
      expect(flow.viewport().zoom).toBe(3);
    });

    it.each([
      { name: 'maximum', zoom: 10, limit: 3 },
      { name: 'minimum', zoom: 0.01, limit: 0.5 },
    ])('keeps setViewport within the $name zoom', async ({ zoom, limit }) => {
      await setup();
      flow.setViewport({ x: 5, y: 6, zoom });
      expect(flow.viewport()).toEqual({ x: 5, y: 6, zoom: limit });
    });

    it('applies changes while every user gesture is disabled', async () => {
      await setup();
      for (const input of ['panOnDrag', 'panOnScroll', 'zoomOnScroll', 'zoomOnPinch', 'zoomOnDoubleClick']) {
        fixture!.componentRef.setInput(input, false);
      }
      fixture!.detectChanges();
      flow.setViewport({ x: 20, y: 30, zoom: 2 });
      expect(flow.viewport()).toEqual({ x: 20, y: 30, zoom: 2 });
    });
  });

  describe('setCenter', () => {
    it('centers a flow point at the current zoom', async () => {
      await setup();
      flow.setViewport({ x: 0, y: 0, zoom: 2 });
      flow.setCenter({ x: 50, y: 25 });
      expect(flow.viewport()).toEqual({ x: 100, y: 100, zoom: 2 });
    });

    it('centers a flow point at the given zoom', async () => {
      await setup();
      flow.setViewport({ x: 0, y: 0, zoom: 2 });
      flow.setCenter({ x: 50, y: 25 }, { zoom: 1 });
      expect(flow.viewport()).toEqual({ x: 150, y: 125, zoom: 1 });
    });

    it('keeps the given zoom within the limits', async () => {
      await setup();
      flow.setCenter({ x: 0, y: 0 }, { zoom: 10 });
      expect(flow.viewport()).toEqual({ x: 200, y: 150, zoom: 3 });
    });

    it('animates to the center when given a duration', async () => {
      await setup();
      const centered = flow.setCenter({ x: 100, y: 0 }, { zoom: 1, duration: 100 });
      await vi.advanceTimersByTimeAsync(200);
      expect(await centered).toBe(true);
      expect(flow.viewport()).toEqual({ x: 100, y: 150, zoom: 1 });
    });
  });

  describe('zoomIn and zoomOut', () => {
    it('zooms in around the pane center by the zoom key step', async () => {
      await setup();
      flow.zoomIn();
      expect(flow.viewport().zoom).toBeCloseTo(1.2, 10);
      expect(flow.viewport().x).toBeCloseTo(-40, 10);
    });

    it('zooms out by the same step', async () => {
      await setup();
      flow.zoomIn();
      flow.zoomOut();
      expect(flow.viewport().zoom).toBeCloseTo(1, 10);
      expect(flow.viewport().x).toBeCloseTo(0, 10);
    });

    it('stops zooming in at the maximum zoom', async () => {
      await setup();
      flow.zoomTo(2.9);
      flow.zoomIn();
      expect(flow.viewport().zoom).toBe(3);
    });

    it('stops zooming out at the minimum zoom', async () => {
      await setup();
      flow.zoomTo(0.55);
      flow.zoomOut();
      expect(flow.viewport().zoom).toBe(0.5);
    });

    it('composes a step requested during an animation with its target', async () => {
      await setup();
      const first = flow.zoomIn({ duration: 100 });
      flow.zoomIn({ duration: 100 });
      expect(await first).toBe(false);
      vi.runAllTimers();
      expect(flow.viewport().zoom).toBeCloseTo(1.44, 10);
    });
  });

  describe('order of changes', () => {
    it('applies consecutive changes in order, each from where the previous one leads', async () => {
      await setup();
      flow.zoomTo(1.5);
      flow.setViewport({ ...flow.viewport(), x: 123, y: 45 });
      expect(flow.viewport()).toEqual({ x: 123, y: 45, zoom: 1.5 });
    });

    it('continues a change from the target zoom of an animation it interrupts', async () => {
      await setup();
      flow.setViewport({ x: 100, y: 50, zoom: 2 }, { duration: 300 });
      vi.advanceTimersByTime(100);
      flow.setCenter({ x: 0, y: 0 });
      expect(flow.viewport()).toEqual({ x: 200, y: 150, zoom: 2 });
    });

    it('resolves an interrupted animation with false and stops it', async () => {
      await setup();
      const first = flow.setViewport({ x: 100, y: 50, zoom: 2 }, { duration: 300 });
      vi.advanceTimersByTime(100);
      flow.setCenter({ x: 0, y: 0 });
      expect(await first).toBe(false);
      vi.runAllTimers();
      expect(flow.viewport()).toEqual({ x: 200, y: 150, zoom: 2 });
    });

    it('builds a change requested in the same task as an animation on its target before its first frame', async () => {
      await setup();
      flow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
      flow.zoomTo(2);
      expect(flow.viewport()).toEqual({ x: -200, y: -150, zoom: 2 });
    });

    it('keeps an effect that changes the viewport from depending on the viewport', async () => {
      await setup();
      let runs = 0;
      TestBed.runInInjectionContext(() =>
        effect(() => {
          runs++;
          flow.setViewport({ x: 10, y: 10, zoom: 1 });
        }),
      );
      TestBed.tick();
      flow.zoomTo(2);
      TestBed.tick();
      expect(runs).toBe(1);
    });
  });

  describe('animation', () => {
    it('passes through intermediate zooms', async () => {
      await setup();
      flow.setViewport({ x: 100, y: 50, zoom: 2 }, { duration: 200 });
      vi.advanceTimersByTime(100);
      expect(flow.viewport().zoom).toBeGreaterThan(1);
      expect(flow.viewport().zoom).toBeLessThan(2);
    });

    it('lands exactly on the target and resolves with true', async () => {
      await setup();
      const reached = flow.setViewport({ x: 100, y: 50, zoom: 2 }, { duration: 200 });
      vi.runAllTimers();
      expect(await reached).toBe(true);
      expect(flow.viewport()).toEqual({ x: 100, y: 50, zoom: 2 });
    });

    it('stops where it is on a press on the pane and resolves with false', async () => {
      await setup();
      const interrupted = flow.zoomTo(2, { duration: 300 });
      vi.advanceTimersByTime(100);
      dispatchPointer(pane, 'pointerdown', { x: 100 });
      const stopped = flow.viewport();
      vi.runAllTimers();
      expect(await interrupted).toBe(false);
      expect(flow.viewport()).toEqual(stopped);
      dispatchPointer(window, 'pointerup', { x: 100 });
    });
  });

  describe('result', () => {
    it.each([
      { name: 'setViewport', change: (flow: VflowComponent) => flow.setViewport({ x: 1, y: 2, zoom: 1 }) },
      { name: 'zoomTo', change: (flow: VflowComponent) => flow.zoomTo(1) },
    ])('resolves $name without a duration with true', async ({ change }) => {
      await setup();
      expect(await change(flow)).toBe(true);
    });

    it('resolves fitView of a flow without nodes with false and keeps the viewport', async () => {
      await setup();
      flow.setViewport({ x: 1, y: 2, zoom: 1 });
      const fitted = flow.fitView({ duration: 100 });
      vi.runAllTimers();
      expect(await fitted).toBe(false);
      expect(flow.viewport()).toEqual({ x: 1, y: 2, zoom: 1 });
    });
  });

  describe('change end', () => {
    it('reports a change without a duration at once, with the viewport', async () => {
      await setup();
      const ends = changeEnds();
      flow.zoomTo(2);
      expect(ends).toEqual([{ x: -200, y: -150, zoom: 2 }]);
    });

    it('reports each of consecutive changes', async () => {
      await setup();
      const ends = changeEnds();
      flow.zoomTo(1.5);
      flow.setViewport({ ...flow.viewport(), x: 123, y: 45 });
      expect(ends).toEqual([
        { x: -100, y: -75, zoom: 1.5 },
        { x: 123, y: 45, zoom: 1.5 },
      ]);
    });

    it('reports an animated change once it lands', async () => {
      await setup();
      const ends = changeEnds();
      flow.setViewport({ x: 10, y: 20, zoom: 2 }, { duration: 100 });
      expect(ends).toEqual([]);
      vi.runAllTimers();
      expect(ends).toEqual([{ x: 10, y: 20, zoom: 2 }]);
    });

    it('reports an animated change where a drag interrupts it, then the drag', async () => {
      await setup();
      const ends = changeEnds();
      flow.setViewport({ x: 100, y: 100, zoom: 2 }, { duration: 300 });
      vi.advanceTimersByTime(100);
      const stopped = flow.viewport();
      pointerDrag(pane, { x: 100 }, [{ x: 140 }]);
      expect(ends).toEqual([stopped, { ...stopped, x: stopped.x + 40 }]);
    });
  });
});
