import { TestBed } from '@angular/core/testing';

import { ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowRenderingService } from './flow-rendering.service';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;
  let rendering: FlowRenderingService;
  let ends: ViewportState[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, FlowRenderingService, ViewportService],
    });
    service = TestBed.inject(ViewportService);
    rendering = TestBed.inject(FlowRenderingService);
    ends = [];
    service.viewportChangeEnd$.subscribe((state) => ends.push(state));
  });

  function pane() {
    rendering.pane.set(document.createElement('div'));
    TestBed.tick();
  }

  it('keeps changes requested before the pane exists and applies them in order once it exists', () => {
    service.change({ zoom: 2 });
    service.change({ x: 10, y: 20 });
    expect(service.readableViewport()).toEqual({ x: 0, y: 0, zoom: 1 });

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
    expect(ends.length).toBe(1);
  });

  it('settles a change with whether it reached its target, and a change that never applied with false', async () => {
    pane();
    expect(await service.change({ zoom: 2 })).toBe(true);
    expect(await service.fitView()).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, FlowRenderingService, ViewportService],
    });
    const pending = TestBed.inject(ViewportService).change({ zoom: 3 });
    TestBed.resetTestingModule();
    expect(await pending).toBe(false);
  });

  it('reports one end per outermost gesture, with where it started and ended', () => {
    service.beginGesture();
    service.beginGesture();
    service.readableViewport.set({ x: 5, y: 0, zoom: 1 });
    expect(service.endGesture()).toBeNull();
    expect(ends).toEqual([]);

    expect(service.endGesture()).toEqual({ start: { x: 0, y: 0, zoom: 1 }, end: { x: 5, y: 0, zoom: 1 } });
    expect(ends).toEqual([{ x: 5, y: 0, zoom: 1 }]);
    expect(service.endGesture()).toBeNull();
  });
});
