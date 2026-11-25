import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel, createHandleMeasureContext } from './handle.model';
import { syncHandle } from './handle.testing';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { HandleLayout, HandlePosition } from '../types/handle-type.type';

type Box = { left: number; top: number; width: number; height: number };

const px = (value: number) => `${value}px`;

/**
 * Lays out a node element with an anchor and a handle inside, measured by the browser. The anchor is in the flow of
 * the node, so the node stays the containing block of the absolutely positioned handle, as in a rendered node.
 */
function layOut(elements: { node: HTMLElement; anchor: HTMLElement; handle: HTMLElement }, boxes: LayoutBoxes) {
  const { node, anchor, handle } = elements;
  Object.assign(node.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    margin: '0px',
    width: px(boxes.node.width),
    height: px(boxes.node.height),
    transform: `scale(${boxes.zoom ?? 1})`,
    transformOrigin: '0 0',
  });
  Object.assign(anchor.style, {
    display: 'block',
    marginLeft: px(boxes.anchor.left),
    marginTop: px(boxes.anchor.top),
    width: px(boxes.anchor.width),
    height: px(boxes.anchor.height),
  });
  Object.assign(handle.style, {
    position: 'absolute',
    left: px(boxes.handle.left),
    top: px(boxes.handle.top),
    width: px(boxes.handle.width),
    height: px(boxes.handle.height),
  });
}

interface LayoutBoxes {
  node: { width: number; height: number };
  anchor: Box;
  handle: Box;
  zoom?: number;
}

describe('HandleModel', () => {
  let nodeElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, NodeRenderingService],
    });
  });

  afterEach(() => nodeElement.remove());

  function createModel(boxes: LayoutBoxes, options: { position?: HandlePosition; layout?: HandleLayout } = {}) {
    nodeElement = document.createElement('div');
    const anchor = document.createElement('div');
    const element = document.createElement('div');
    anchor.append(element);
    nodeElement.append(anchor);
    document.body.append(nodeElement);
    const elements = { node: nodeElement, anchor, handle: element };
    layOut(elements, boxes);

    const parentNode = TestBed.runInInjectionContext(
      () => new NodeModel(createNode({ id: '1', point: { x: 0, y: 0 } })),
    );
    parentNode.nodeElement.set(nodeElement);

    const position = signal<HandlePosition>(options.position ?? 'right');
    const layout = signal<HandleLayout>(options.layout ?? 'auto');
    const offsetX = signal(0);
    const model = new HandleModel({ type: signal('source'), position, layout, offsetX, element }, parentNode);

    return { model, parentNode, position, layout, offsetX, relayOut: (next: LayoutBoxes) => layOut(elements, next) };
  }

  const ROW = { node: { width: 100, height: 40 }, anchor: { left: 0, top: 0, width: 100, height: 40 } };

  it('places the handle at the middle of its anchor, on the side of the node', () => {
    const { model } = createModel({
      node: { width: 100, height: 100 },
      anchor: { left: 10, top: 30, width: 80, height: 20 },
      handle: { left: 90, top: 35, width: 20, height: 10 },
    });

    syncHandle(model);

    expect(model.layoutStyles()?.top).toBe('40px');
    expect(model.pointAbsolute()).toEqual({ x: 110, y: 40 });
  });

  it('keeps a handle aligned with its anchor after the node grows, at non-unit zoom', () => {
    const { model, parentNode, relayOut } = createModel({
      node: { width: 100, height: 100 },
      anchor: { left: 10, top: 30, width: 80, height: 20 },
      handle: { left: 90, top: 35, width: 20, height: 10 },
    });
    syncHandle(model);

    parentNode.width.set(160);
    parentNode.height.set(160);
    relayOut({
      node: { width: 160, height: 160 },
      anchor: { left: 10, top: 70, width: 140, height: 20 },
      handle: { left: 150, top: 75, width: 20, height: 10 },
      zoom: 2,
    });
    syncHandle(model, 2);

    expect(model.layoutStyles()?.top).toBe('80px');
    expect(model.pointAbsolute()).toEqual({ x: 170, y: 80 });
  });

  it('derives the point and the layout styles of a side from one measurement', () => {
    const { model } = createModel({ ...ROW, handle: { left: 30, top: 10, width: 10, height: 20 } });

    syncHandle(model);

    expect(model.localPoint()).toEqual({ x: 105, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: 'calc(100% + 0px)' });
  });

  it('moves the point and the element by the offset without a new measurement', () => {
    const { model, position, offsetX } = createModel({ ...ROW, handle: { left: 30, top: 10, width: 10, height: 20 } });
    syncHandle(model);

    position.set('left');
    offsetX.set(4);

    expect(model.localPoint()).toEqual({ x: -1, y: 20 });
    expect(model.layoutStyles()).toEqual({ top: '20px', left: '4px' });
  });

  it.each<[HandlePosition, { x: number; y: number }]>([
    ['right', { x: 40, y: 20 }],
    ['bottom', { x: 35, y: 30 }],
  ])(
    'takes the middle of the %s side of the element as rendered in the manual layout, ignoring offsets',
    (side, point) => {
      const { model, offsetX } = createModel(
        { ...ROW, handle: { left: 30, top: 10, width: 10, height: 20 } },
        { position: side, layout: 'manual' },
      );
      offsetX.set(4);

      syncHandle(model);

      expect(model.layoutStyles()).toBeNull();
      expect(model.localPoint()).toEqual(point);
    },
  );

  it('follows the node size on the right side without a new measurement', () => {
    const { model, parentNode } = createModel({ ...ROW, handle: { left: 90, top: 15, width: 10, height: 10 } });
    syncHandle(model);

    parentNode.width.set(200);

    expect(model.localPoint()).toEqual({ x: 205, y: 20 });
  });

  it('needs no measurement for a dynamic position and puts its point at the node center', () => {
    const { model, parentNode } = createModel(
      { ...ROW, handle: { left: 90, top: 15, width: 10, height: 10 } },
      { position: 'auto' },
    );

    expect(model.isMeasured()).toBe(true);
    expect(model.localPoint()).toEqual({ x: parentNode.width() / 2, y: parentNode.height() / 2 });
    expect(model.measure(createHandleMeasureContext(nodeElement, null, 1))).toBeNull();
  });

  it('waits for a measurement again when a dynamic position becomes a side', () => {
    const { model, position } = createModel(
      { ...ROW, handle: { left: 90, top: 15, width: 10, height: 10 } },
      { position: 'auto' },
    );

    position.set('right');

    expect(model.isMeasured()).toBe(false);
  });

  it('forgets its measurement on reset', () => {
    const { model } = createModel({ ...ROW, handle: { left: 90, top: 15, width: 10, height: 10 } });
    syncHandle(model);

    model.reset();

    expect(model.isMeasured()).toBe(false);
    expect(model.layoutStyles()).toBeNull();
  });

  it('is measured again after a reset by the next measurement', () => {
    const { model } = createModel({ ...ROW, handle: { left: 90, top: 15, width: 10, height: 10 } });
    syncHandle(model);
    model.reset();

    syncHandle(model);

    expect(model.isMeasured()).toBe(true);
  });
});
