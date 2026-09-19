import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HANDLE_WITHOUT_BOX, HandleModel } from './handle.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { Position } from '../types/position.type';
import { HandleLayout } from '../types/handle-type.type';

type Rect = { left: number; top: number; width: number; height: number };

function mockRect(element: Element, { left, top, width, height }: Rect): void {
  element.getClientRects = () => [element.getBoundingClientRect()] as unknown as DOMRectList;
  element.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('HandleModel', () => {
  let viewportService: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        provideZonelessChangeDetection(),
      ],
    });

    viewportService = TestBed.inject(ViewportService);
    viewportService.readableViewport.set({ zoom: 1, x: 0, y: 0 });
  });

  function createModel(anchorRect: Rect, options: { position?: Position; layout?: HandleLayout } = {}) {
    const anchor = document.createElement('div');
    const nodeElement = document.createElement('div');
    const element = document.createElement('div');
    anchor.append(element);

    mockRect(anchor, anchorRect);
    mockRect(nodeElement, { left: 0, top: 0, width: 100, height: 100 });

    const parentNode = TestBed.runInInjectionContext(
      () => new NodeModel(createNode({ id: '1', point: { x: 0, y: 0 } })),
    );
    parentNode.nodeElement.set(nodeElement);

    const position = signal<Position>(options.position ?? 'right');
    const layout = signal<HandleLayout>(options.layout ?? 'auto');
    const offsetX = signal(0);
    const model = TestBed.runInInjectionContext(
      () => new HandleModel({ type: signal('source'), position, layout, offsetX, element }, parentNode),
    );

    return { model, parentNode, nodeElement, element, anchor, position, layout, offsetX };
  }

  it('should keep a handle aligned with its anchor after node resize', () => {
    const { model, parentNode, anchor, nodeElement, element } = createModel({
      left: 10,
      top: 30,
      width: 80,
      height: 20,
    });

    mockRect(element, { left: 90, top: 35, width: 20, height: 10 });

    model.sync();

    expect(model.layoutStyles().top).toBe('40px');
    expect(model.pointAbsolute()).toEqual({ x: 110, y: 40 });

    viewportService.readableViewport.set({ zoom: 2, x: 0, y: 0 });
    parentNode.width.set(160);
    parentNode.height.set(160);
    mockRect(nodeElement, { left: 0, top: 0, width: 320, height: 320 });
    mockRect(anchor, { left: 20, top: 140, width: 280, height: 40 });
    mockRect(element, { left: 300, top: 150, width: 40, height: 20 });

    model.sync();

    expect(model.layoutStyles().top).toBe('80px');
    expect(model.pointAbsolute()).toEqual({ x: 170, y: 80 });
  });

  it('should read the side, offset and layout on every measurement', () => {
    const { model, element, position, layout, offsetX } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    mockRect(element, { left: 30, top: 10, width: 10, height: 20 });

    model.sync();
    expect(model.localPoint()).toEqual({ x: 105, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: 'auto', right: '0', bottom: 'auto' });

    // A positive offset moves the element and its point to the right.
    position.set('left');
    offsetX.set(4);
    model.sync();
    expect(model.localPoint()).toEqual({ x: -1, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: '0', right: 'auto', bottom: 'auto' });

    // The manual layout takes the middle of the element's side as it is rendered and ignores offsets.
    layout.set('manual');
    model.sync();
    expect(model.localPoint()).toEqual({ x: 30, y: 20 });

    position.set('bottom');
    model.sync();
    expect(model.localPoint()).toEqual({ x: 35, y: 30 });
  });

  it('should leave an element without a layout box unmeasured and warn once', () => {
    const { model, element, parentNode } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    const warn = spyOn(console, 'warn');
    mockRect(element, { left: 90, top: 15, width: 10, height: 10 });
    model.sync();
    parentNode.isMeasured.set(true);
    parentNode.handles.set([model]);
    expect(parentNode.isReady()).toBeTrue();

    element.getClientRects = () => [] as unknown as DOMRectList;
    expect(model.measure()).toBe(HANDLE_WITHOUT_BOX);
    model.sync();
    model.sync();

    expect(model.isMeasured()).toBeFalse();
    expect(model.hasBox()).toBeFalse();
    // The node does not wait for a handle that cannot be measured.
    expect(parentNode.isReady()).toBeTrue();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.calls.mostRecent().args[0]).toContain('has no layout box');
  });
});
