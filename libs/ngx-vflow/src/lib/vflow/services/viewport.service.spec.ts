import { TestBed } from '@angular/core/testing';

import { ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowRenderingService } from './flow-rendering.service';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';

const PROVIDERS = [FlowEntitiesService, FlowSettingsService, FlowRenderingService, ViewportService];

describe('ViewportService', () => {
  let service: ViewportService;
  let rendering: FlowRenderingService;
  let ends: ViewportState[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: PROVIDERS });
    service = TestBed.inject(ViewportService);
    rendering = TestBed.inject(FlowRenderingService);
    ends = [];
    service.viewportChangeEnd$.subscribe((state) => ends.push(state));
  });

  function pane() {
    rendering.pane.set(document.createElement('div'));
    TestBed.tick();
  }

  it('keeps changes requested before the pane exists', () => {
    service.change({ zoom: 2 });

    expect(service.readableViewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(ends).toEqual([]);
  });

  it('applies the kept changes in order once the pane exists', () => {
    service.change({ zoom: 2 });
    service.change({ x: 10, y: 20 });

    pane();

    expect(service.readableViewport()).toEqual({ x: 10, y: 20, zoom: 2 });
    expect(ends).toEqual([
      { x: 0, y: 0, zoom: 2 },
      { x: 10, y: 20, zoom: 2 },
    ]);
  });

  it('applies a change at once while the pane exists', () => {
    pane();

    service.change({ zoom: 2 });

    expect(service.readableViewport().zoom).toBe(2);
    expect(ends).toEqual([{ x: 0, y: 0, zoom: 2 }]);
  });

  it('settles a change that reached its target with true', async () => {
    pane();

    expect(await service.change({ zoom: 2 })).toBe(true);
  });

  it('settles fitView with false when there is nothing to fit', async () => {
    pane();

    expect(await service.fitView()).toBe(false);
  });

  it('settles a change that never applied with false once the flow is destroyed', async () => {
    const pending = service.change({ zoom: 3 });

    TestBed.resetTestingModule();

    expect(await pending).toBe(false);
  });

  it('reports no end while an outer gesture is still in progress', () => {
    service.beginGesture();
    service.beginGesture();
    service.readableViewport.set({ x: 5, y: 0, zoom: 1 });

    expect(service.endGesture()).toBeNull();
    expect(ends).toEqual([]);
  });

  it('reports one end for the outermost gesture, with where it started and ended', () => {
    service.beginGesture();
    service.beginGesture();
    service.readableViewport.set({ x: 5, y: 0, zoom: 1 });
    service.endGesture();

    expect(service.endGesture()).toEqual({ start: { x: 0, y: 0, zoom: 1 }, end: { x: 5, y: 0, zoom: 1 } });
    expect(ends).toEqual([{ x: 5, y: 0, zoom: 1 }]);
  });

  it('reports nothing for an end without a gesture', () => {
    expect(service.endGesture()).toBeNull();
    expect(ends).toEqual([]);
  });
});
