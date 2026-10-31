import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HANDLE_WITHOUT_BOX, HandleModel, createHandleMeasureContext } from './handle.model';
import { syncHandle } from './handle.testing';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { HandleLayout, HandlePosition } from '../types/handle-type.type';

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
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, NodeRenderingService],
    });
  });

  function createModel(anchorRect: Rect, options: { position?: HandlePosition; layout?: HandleLayout } = {}) {
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

    const position = signal<HandlePosition>(options.position ?? 'right');
    const layout = signal<HandleLayout>(options.layout ?? 'auto');
    const offsetX = signal(0);
    const model = new HandleModel({ type: signal('source'), position, layout, offsetX, element }, parentNode);

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

    syncHandle(model);

    expect(model.layoutStyles().top).toBe('40px');
    expect(model.pointAbsolute()).toEqual({ x: 110, y: 40 });

    parentNode.width.set(160);
    parentNode.height.set(160);
    mockRect(nodeElement, { left: 0, top: 0, width: 320, height: 320 });
    mockRect(anchor, { left: 20, top: 140, width: 280, height: 40 });
    mockRect(element, { left: 300, top: 150, width: 40, height: 20 });

    syncHandle(model, 2);

    expect(model.layoutStyles().top).toBe('80px');
    expect(model.pointAbsolute()).toEqual({ x: 170, y: 80 });
  });

  it('should derive the side, offset and layout from one measurement', () => {
    const { model, element, position, layout, offsetX } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    mockRect(element, { left: 30, top: 10, width: 10, height: 20 });

    syncHandle(model);
    expect(model.localPoint()).toEqual({ x: 105, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: 'auto', right: '0', bottom: 'auto' });

    // A positive offset moves the element and its point to the right; no new measurement is needed.
    position.set('left');
    offsetX.set(4);
    expect(model.localPoint()).toEqual({ x: -1, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: '0', right: 'auto', bottom: 'auto' });

    // The manual layout takes the middle of the element's side as it is rendered and ignores offsets.
    layout.set('manual');
    expect(model.localPoint()).toEqual({ x: 30, y: 20 });

    position.set('bottom');
    expect(model.localPoint()).toEqual({ x: 35, y: 30 });
  });

  it('should follow the node size for the right and bottom sides without a new measurement', () => {
    const { model, parentNode, element } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    mockRect(element, { left: 90, top: 15, width: 10, height: 10 });

    syncHandle(model);
    expect(model.localPoint()).toEqual({ x: 105, y: 20 });

    parentNode.width.set(200);
    expect(model.localPoint()).toEqual({ x: 205, y: 20 });
  });

  it('should need no measurement for a dynamic position', () => {
    const { model, parentNode, position } = createModel(
      { left: 0, top: 0, width: 100, height: 40 },
      { position: 'auto' },
    );

    expect(model.isMeasured()).toBe(true);
    expect(model.localPoint()).toEqual({ x: parentNode.width() / 2, y: parentNode.height() / 2 });
    expect(model.measure(createHandleMeasureContext(parentNode.nodeElement()!, 1))).toBeNull();

    // A side waits for a measurement again.
    position.set('right');
    expect(model.isMeasured()).toBe(false);
  });

  it('should leave an element without a layout box unmeasured', () => {
    const { model, element, parentNode } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    mockRect(element, { left: 90, top: 15, width: 10, height: 10 });
    syncHandle(model);
    parentNode.isMeasured.set(true);
    parentNode.handles.set([model]);
    expect(parentNode.isReady()).toBe(true);

    element.getClientRects = () => [] as unknown as DOMRectList;
    expect(model.measure(createHandleMeasureContext(parentNode.nodeElement()!, 1))).toBe(HANDLE_WITHOUT_BOX);
    syncHandle(model);
    syncHandle(model);

    expect(model.isMeasured()).toBe(false);
    expect(model.hasBox()).toBe(false);
    // The node does not wait for a handle that cannot be measured.
    expect(parentNode.isReady()).toBe(true);

    // A handle that gets its box back is measured again.
    mockRect(element, { left: 90, top: 15, width: 10, height: 10 });
    syncHandle(model);
    expect(model.hasBox()).toBe(true);
    expect(model.isMeasured()).toBe(true);
    element.getClientRects = () => [] as unknown as DOMRectList;
    syncHandle(model);
    expect(model.hasBox()).toBe(false);
  });

  it('should forget its measurement on reset and wait for the next one', () => {
    const { model, element } = createModel({ left: 0, top: 0, width: 100, height: 40 });
    mockRect(element, { left: 90, top: 15, width: 10, height: 10 });
    syncHandle(model);
    expect(model.isMeasured()).toBe(true);

    model.reset();
    expect(model.isMeasured()).toBe(false);
    expect(model.layoutStyles()).toEqual({ top: 'auto', left: 'auto', right: 'auto', bottom: 'auto' });

    syncHandle(model);
    expect(model.isMeasured()).toBe(true);
  });
});
