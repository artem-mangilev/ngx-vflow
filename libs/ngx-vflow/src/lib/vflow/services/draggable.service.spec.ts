import { signal } from '@angular/core';
import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { DraggableService } from './draggable.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';
import { NodeRenderingService } from './node-rendering.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { KeyboardService } from './keyboard.service';
import { ResizeObserverService } from './resize-observer.service';
import { PointerInit, dispatchPointer } from '../gestures/pointer-events.testing';
import { AlignmentService } from './alignment.service';
import { FlowRenderingService } from './flow-rendering.service';

type PaneBox = { left: number; top: number; width: number; height: number };

describe('DraggableService', () => {
  let service: DraggableService;
  let entitiesService: FlowEntitiesService;
  let viewportService: ViewportService;
  let resizeCallback: ResizeObserverCallback;
  let resizeObserver: { observe: Mock; unobserve: Mock; disconnect: Mock };
  let positionCallback: IntersectionObserverCallback | null;
  let positionObserver: { observe: Mock; disconnect: Mock };
  let originalResizeObserver: typeof ResizeObserver;
  let originalIntersectionObserver: typeof IntersectionObserver;
  let panes: HTMLElement[];

  beforeEach(() => {
    // A drag swallows the click that follows it until a timer of zero runs.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    // The browser observers are the boundary: the specs report resizes and position changes themselves.
    originalResizeObserver = window.ResizeObserver;
    resizeObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    window.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = resizeObserver.observe;
      unobserve = resizeObserver.unobserve;
      disconnect = resizeObserver.disconnect;
    } as unknown as typeof ResizeObserver;

    originalIntersectionObserver = window.IntersectionObserver;
    positionCallback = null;
    positionObserver = { observe: vi.fn(), disconnect: vi.fn() };
    window.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        positionCallback = callback;
      }
      observe = positionObserver.observe;
      disconnect = positionObserver.disconnect;
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;

    TestBed.configureTestingModule({
      providers: [
        DraggableService,
        FlowEntitiesService,
        FlowSettingsService,
        ViewportService,
        NodeRenderingService,
        AlignmentService,
        FlowRenderingService,
        ResizeObserverService,
        KeyboardService,
      ],
    });

    service = TestBed.inject(DraggableService);
    entitiesService = TestBed.inject(FlowEntitiesService);
    viewportService = TestBed.inject(ViewportService);
    panes = [];
  });

  afterEach(() => {
    // Releases held keys and any drag left in progress.
    window.dispatchEvent(new Event('blur'));
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    panes.forEach((pane) => pane.remove());
    window.ResizeObserver = originalResizeObserver;
    window.IntersectionObserver = originalIntersectionObserver;
  });

  function createModel(params: {
    id: string;
    selected?: boolean;
    draggable?: boolean;
    parentId?: string;
    size?: [number, number];
  }) {
    const model = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: params.id,
            point: { x: 0, y: 0 },
            selected: params.selected ?? false,
            draggable: params.draggable ?? true,
            parentId: params.parentId,
            width: params.size?.[0],
            height: params.size?.[1],
          }),
        ),
    );

    entitiesService.nodes.update((nodes) => [...nodes, model]);

    return model;
  }

  function placePane(pane: HTMLElement, { left, top, width, height }: PaneBox) {
    Object.assign(pane.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
  }

  /** A pane the browser lays out at `box`, registered as the pane of the flow, with an element of a node inside. */
  function createDragSurface(box: PaneBox = { left: 0, top: 0, width: 400, height: 300 }) {
    const pane = document.createElement('div');
    pane.style.position = 'fixed';
    placePane(pane, box);
    TestBed.inject(FlowRenderingService).pane.set(pane);
    const element = document.createElement('div');
    pane.append(element);
    document.body.append(pane);
    panes.push(pane);

    return { pane, element };
  }

  /** The element a press lands on; moves and releases go to the window. */
  let currentElement: HTMLElement;

  const pointer = (type: string, x: number, y: number, init: Partial<PointerInit> = {}) =>
    dispatchPointer(type === 'pointerdown' ? currentElement : window, type, { x, y, ...init });

  /** The types of the drag events reported from now on. */
  function dragEvents(): string[] {
    const types: string[] = [];
    service.events$.subscribe((event) => types.push(event.type));
    return types;
  }

  /** Presses a node at (10, 20) at client (150, 100). */
  function startNodeDrag(box?: PaneBox) {
    const model = createModel({ id: 'node' });
    model.setPoint({ x: 10, y: 20 });
    const surface = createDragSurface(box);
    currentElement = surface.element;

    service.enable(surface.element, model);
    pointer('pointerdown', 150, 100);

    return { model, ...surface };
  }

  /** Makes a press start the drag, for the specs about what a drag in progress observes before its first move. */
  function dragFromThePress() {
    TestBed.inject(FlowSettingsService).bind({ nodeDragThreshold: signal(0) });
  }

  function holdKey(key: string, code: string) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, code }));
  }

  function releaseKey(key: string, code: string) {
    document.dispatchEvent(new KeyboardEvent('keyup', { key, code }));
  }

  function clicksOn(element: HTMLElement) {
    const clicks = { count: 0 };
    element.addEventListener('click', () => clicks.count++);
    return clicks;
  }

  describe('threshold', () => {
    beforeEach(() => {
      TestBed.inject(FlowSettingsService).bind({ nodeDragThreshold: signal(10) });
      viewportService.readableViewport.set({ x: 0, y: 0, zoom: 2 });
    });

    it('does not drag before the pointer crosses the threshold in client pixels at non-unit zoom', () => {
      const drags = dragEvents();
      const { model } = startNodeDrag();

      pointer('pointermove', 156, 100);

      expect(model.point()).toEqual({ x: 10, y: 20 });
      expect(drags).toEqual([]);
    });

    it('starts the drag at the move that crosses the threshold, with the distance it took', () => {
      const drags = dragEvents();
      const { model } = startNodeDrag();

      pointer('pointermove', 162, 100);

      expect(model.point()).toEqual({ x: 16, y: 20 });
      expect(drags).toEqual(['start']);
    });

    it('reports no drag end for a release below the threshold', () => {
      const drags = dragEvents();
      const { model } = startNodeDrag();

      pointer('pointerup', 150, 100);

      expect(model.point()).toEqual({ x: 10, y: 20 });
      expect(drags).toEqual([]);
    });
  });

  it('does not drag a press that moves within the default threshold', () => {
    const drags = dragEvents();
    const { model } = startNodeDrag();

    pointer('pointermove', 152, 101);
    pointer('pointerup', 152, 101);

    expect(model.point()).toEqual({ x: 10, y: 20 });
    expect(drags).toEqual([]);
  });

  it('keeps the click of a press that moves within the default threshold', () => {
    const { element } = startNodeDrag();
    const clicks = clicksOn(element);

    pointer('pointermove', 152, 101);
    pointer('pointerup', 152, 101);
    element.click();

    expect(clicks.count).toBe(1);
  });

  it('suppresses the click that follows a drag', () => {
    const { element } = startNodeDrag();
    const clicks = clicksOn(element);

    pointer('pointermove', 175, 100);
    pointer('pointerup', 175, 100);
    element.click();

    expect(clicks.count).toBe(0);
  });

  it('lets clicks through again once the click that follows a drag has passed', () => {
    const { element } = startNodeDrag();
    const clicks = clicksOn(element);
    pointer('pointermove', 175, 100);
    pointer('pointerup', 175, 100);

    vi.runAllTimers();
    element.click();

    expect(clicks.count).toBe(1);
  });

  it('ends the drag where the browser cancels the pointer', () => {
    const drags = dragEvents();
    const { model } = startNodeDrag();
    pointer('pointermove', 160, 100);

    dispatchPointer(window, 'pointercancel', { x: 160, y: 100 });

    expect(drags.at(-1)).toBe('end');
    expect(model.dragging()).toBe(false);
    expect(model.point()).toEqual({ x: 20, y: 20 });
  });

  it('ends the drag when the window loses focus and ignores later moves', () => {
    const { model } = startNodeDrag();
    pointer('pointermove', 170, 100);

    window.dispatchEvent(new Event('blur'));
    pointer('pointermove', 190, 100);

    expect(model.dragging()).toBe(false);
    expect(model.point()).toEqual({ x: 30, y: 20 });
  });

  it('ends a mouse drag whose release happened out of sight', () => {
    const drags = dragEvents();
    startNodeDrag();
    pointer('pointermove', 160, 100);

    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 0 }));

    expect(drags.at(-1)).toBe('end');
  });

  describe('presses that do not drag', () => {
    beforeEach(dragFromThePress);

    it.each([
      ['the middle button', { button: 1 }],
      ['the secondary button', { button: 2 }],
      ['ctrl held, the context menu on macOS', { ctrlKey: true }],
    ])('ignores a press with %s', (_, init) => {
      const drags = dragEvents();
      const { model } = startNodeDrag();
      pointer('pointerup', 150, 100);

      pointer('pointerdown', 150, 100, init);
      pointer('pointermove', 180, 100, init);

      expect(drags).toEqual(['start', 'end']);
      expect(model.dragging()).toBe(false);
    });

    it('ignores a press inside a no-drag element of the node', () => {
      const drags = dragEvents();
      const model = createModel({ id: 'node' });
      const { element } = createDragSurface();
      const control = document.createElement('div');
      control.setAttribute('data-v-no-drag', '');
      const target = document.createElement('span');
      control.append(target);
      element.append(control);
      service.enable(element, model);

      dispatchPointer(target, 'pointerdown', { x: 150, y: 100 });
      pointer('pointermove', 180, 100);

      expect(drags).toEqual([]);
      expect(model.point()).toEqual({ x: 0, y: 0 });
    });

    it('does not drag a group while the selection modifier is held', () => {
      const drags = dragEvents();
      const group = createModel({ id: 'group' });
      createModel({ id: 'member', parentId: 'group' });
      const { element } = createDragSurface();
      currentElement = element;
      service.enable(element, group);
      holdKey('Shift', 'ShiftLeft');

      pointer('pointerdown', 150, 100);
      pointer('pointermove', 180, 100);

      expect(drags).toEqual([]);
      expect(group.point()).toEqual({ x: 0, y: 0 });
    });
  });

  it('drags a node that is not a group while the selection modifier is held', () => {
    dragFromThePress();
    holdKey('Shift', 'ShiftLeft');
    const { model } = startNodeDrag();

    pointer('pointermove', 180, 100);

    expect(model.point()).toEqual({ x: 40, y: 20 });
  });

  describe('moveSelected', () => {
    it('moves a selected parent without its selected child, which follows in local coordinates', () => {
      const parent = createModel({ id: 'parent', selected: true });
      const child = createModel({ id: 'child', selected: true, parentId: 'parent' });

      expect(service.moveSelected(child, { x: 1, y: 0 }, false)).toEqual([parent]);
      expect(parent.point()).toEqual({ x: 5, y: 0 });
      expect(child.point()).toEqual({ x: 0, y: 0 });
    });

    it('moves a selected child of an unselected parent by itself', () => {
      const parent = createModel({ id: 'parent', selected: false, size: [100, 50] });
      const child = createModel({ id: 'child', selected: true, parentId: 'parent', size: [80, 30] });

      expect(service.moveSelected(child, { x: 0, y: 1 }, false)).toEqual([child]);
      expect(parent.point()).toEqual({ x: 0, y: 0 });
      expect(child.point()).toEqual({ x: 0, y: 5 });
    });

    it('moves four times as far when accelerated', () => {
      const node = createModel({ id: 'node', selected: true });

      service.moveSelected(node, { x: 1, y: 0 }, true);

      expect(node.point()).toEqual({ x: 20, y: 0 });
    });

    it.each([
      [
        { x: 1, y: 1 },
        { x: 20, y: 20 },
      ],
      [
        { x: -1, y: -1 },
        { x: 0, y: 0 },
      ],
    ])('keeps a child moved by %o inside its parent', (direction, expected) => {
      createModel({ id: 'parent', size: [100, 50] });
      const child = createModel({ id: 'child', selected: true, parentId: 'parent', size: [80, 30] });

      service.moveSelected(child, direction, true);

      expect(child.point()).toEqual(expected);
    });

    it('moves a selected node by one cell of the grid', () => {
      TestBed.inject(FlowSettingsService).bind({ snapGrid: signal([10, 10]) });
      const node = createModel({ id: 'node', selected: true });

      service.moveSelected(node, { x: 1, y: 0 }, false);

      expect(node.point()).toEqual({ x: 10, y: 0 });
    });

    it('moves only the topmost selected ancestor of a hierarchy, together with unrelated selected nodes', () => {
      const grandParent = createModel({ id: 'grand-parent', selected: true });
      const parent = createModel({ id: 'parent', selected: true, parentId: 'grand-parent' });
      const child = createModel({ id: 'child', selected: true, parentId: 'parent' });
      const standalone = createModel({ id: 'standalone', selected: true });

      expect(service.moveSelected(child, { x: 1, y: 0 }, true)).toEqual([grandParent, standalone]);
      expect([grandParent, parent, child, standalone].map((node) => node.point().x)).toEqual([20, 0, 0, 20]);
    });

    it('moves nothing from an unselected node', () => {
      const selected = createModel({ id: 'selected', selected: true });
      const unselected = createModel({ id: 'unselected' });

      expect(service.moveSelected(unselected, { x: 1, y: 0 }, false)).toEqual([]);
      expect(selected.point()).toEqual({ x: 0, y: 0 });
    });
  });

  it('keeps the dragged node under the pointer while the origin of its parent moves', () => {
    const parent = createModel({ id: 'parent', size: [300, 300] });
    parent.setPoint({ x: 100, y: 100 });
    const child = createModel({ id: 'child', parentId: 'parent', size: [50, 50] });
    child.rawNode.extent!.set(null);
    child.setPoint({ x: 50, y: 50 });
    const { element } = createDragSurface({ left: 0, top: 0, width: 800, height: 600 });
    currentElement = element;
    service.enable(element, child);

    pointer('pointerdown', 150, 100);
    pointer('pointermove', 160, 100);
    expect(child.point()).toEqual({ x: 60, y: 50 });

    // The parent grows to the left by 20 and keeps the child in place, as a parent auto-size would.
    parent.setPoint({ x: 80, y: 100 });
    child.setPoint({ x: 80, y: 50 });
    pointer('pointermove', 170, 100);

    expect(child.point()).toEqual({ x: 90, y: 50 });
    expect(child.globalPoint()).toEqual({ x: 170, y: 150 });
  });

  it('snaps a dragged nested node to the grid of the flow, not of its parent', () => {
    TestBed.inject(FlowSettingsService).bind({ snapGrid: signal([10, 10]) });
    const parent = createModel({ id: 'parent', size: [300, 300] });
    parent.setPoint({ x: 5, y: 5 });
    const child = createModel({ id: 'child', parentId: 'parent', size: [50, 50] });
    child.setPoint({ x: 10, y: 10 });
    const { element } = createDragSurface({ left: 0, top: 0, width: 800, height: 600 });
    currentElement = element;
    service.enable(element, child);

    pointer('pointerdown', 150, 100);
    pointer('pointermove', 153, 101);

    expect(child.globalPoint()).toEqual({ x: 20, y: 20 });
    expect(child.point()).toEqual({ x: 15, y: 15 });
  });

  describe('pane geometry', () => {
    const PANE = { left: 100, top: 50, width: 800, height: 600 };

    function reportResize(pane: HTMLElement, width: number, height: number) {
      resizeCallback(
        [{ target: pane, contentRect: new DOMRect(0, 0, width, height) } as unknown as ResizeObserverEntry],
        resizeObserver as unknown as ResizeObserver,
      );
    }

    function reportPosition(pane: HTMLElement, box: PaneBox) {
      positionCallback!(
        [
          {
            boundingClientRect: new DOMRect(box.left, box.top, box.width, box.height),
            target: pane,
          } as unknown as IntersectionObserverEntry,
        ],
        positionObserver as unknown as IntersectionObserver,
      );
    }

    it('reuses the pane position read at the start of the drag at non-unit zoom', () => {
      viewportService.readableViewport.set({ x: 0, y: 0, zoom: 1.6245 });
      const { model, pane } = startNodeDrag(PANE);
      pointer('pointermove', 180, 120);

      // Moved without a resize, a scroll or a reported position: the drag must not read the pane again.
      placePane(pane, { ...PANE, left: 0, top: 0 });
      pointer('pointermove', 210, 140);

      expect(model.point().x).toBeCloseTo(46.93, 2);
      expect(model.point().y).toBeCloseTo(44.62, 2);
    });

    it('reads the pane again after it is resized', () => {
      dragFromThePress();
      const { model, pane } = startNodeDrag(PANE);

      placePane(pane, { left: 120, top: 50, width: 700, height: 600 });
      reportResize(pane, 700, 600);
      pointer('pointermove', 210, 140);

      expect(model.point()).toEqual({ x: 50, y: 60 });
    });

    it('keeps the pane position when a resize report does not change its size', () => {
      dragFromThePress();
      const { model, pane } = startNodeDrag(PANE);

      placePane(pane, { ...PANE, left: 120 });
      reportResize(pane, 800, 600);
      pointer('pointermove', 210, 140);

      expect(model.point()).toEqual({ x: 70, y: 60 });
    });

    it('reads the pane again after the document scrolls', () => {
      dragFromThePress();
      const { model, pane } = startNodeDrag(PANE);

      placePane(pane, { ...PANE, left: 130, top: 60 });
      document.dispatchEvent(new Event('scroll'));
      pointer('pointermove', 220, 150);

      expect(model.point()).toEqual({ x: 50, y: 60 });
    });

    it('stops observing the size of the pane when the drag ends', () => {
      dragFromThePress();
      const { pane } = startNodeDrag(PANE);

      pointer('pointerup', 150, 100);

      expect(resizeObserver.unobserve).toHaveBeenCalledWith(pane);
    });

    it('takes a position-only change of the pane from the intersection observer', () => {
      dragFromThePress();
      const { model, pane } = startNodeDrag(PANE);

      // The entry alone carries the new position: the pane itself stays where it was.
      reportPosition(pane, { ...PANE, left: 120 });
      pointer('pointermove', 210, 140);

      expect(model.point()).toEqual({ x: 50, y: 60 });
    });

    it('ignores a reported position that did not change', () => {
      dragFromThePress();
      const { model, pane } = startNodeDrag(PANE);

      placePane(pane, { ...PANE, left: 0 });
      reportPosition(pane, PANE);
      pointer('pointermove', 210, 140);

      expect(model.point()).toEqual({ x: 70, y: 60 });
    });

    it('stops observing the position of the pane when the drag ends', () => {
      dragFromThePress();
      startNodeDrag(PANE);

      pointer('pointerup', 150, 100);

      expect(positionObserver.disconnect).toHaveBeenCalled();
    });

    it('keeps the node under the pointer while the viewport pans and zooms', () => {
      dragFromThePress();
      const { model } = startNodeDrag(PANE);

      viewportService.readableViewport.set({ x: 20, y: 0, zoom: 1 });
      TestBed.flushEffects();
      pointer('pointermove', 210, 140);
      expect(model.point()).toEqual({ x: 50, y: 60 });

      viewportService.readableViewport.set({ x: 20, y: 0, zoom: 2 });
      TestBed.flushEffects();
      pointer('pointermove', 300, 210);
      expect(model.point()).toEqual({ x: 50, y: 50 });
    });

    it('keeps the node under a still pointer when the viewport zooms during the drag', () => {
      dragFromThePress();
      const { model } = startNodeDrag(PANE);

      // The press is at flow (50, 50), 40 and 30 flow units from the node origin; at zoom 2 it is over flow (25, 25).
      viewportService.readableViewport.set({ x: 0, y: 0, zoom: 2 });
      TestBed.flushEffects();

      expect(model.point()).toEqual({ x: -15, y: -5 });
    });
  });

  describe('with the alignment helper', () => {
    let alignment: AlignmentService;

    beforeEach(() => {
      TestBed.inject(FlowSettingsService).bind({ alignmentHelper: signal(true) });
      // The specs move a node by a few pixels to reach an alignment: every pixel from the press counts.
      dragFromThePress();
      alignment = TestBed.inject(AlignmentService);
    });

    function placed(params: Parameters<typeof createModel>[0], x: number, y: number) {
      const model = createModel(params);
      model.setPoint({ x, y });
      model.width.set(100);
      model.height.set(50);
      model.inViewport.set(true);
      return model;
    }

    /** Presses `model` at client (150, 100) on a pane at the origin and moves the pointer by `dx`, `dy`. */
    function drag(model: NodeModel, dx: number, dy: number) {
      const { element } = createDragSurface({ left: 0, top: 0, width: 800, height: 600 });
      currentElement = element;
      service.enable(element, model);
      pointer('pointerdown', 150, 100);
      pointer('pointermove', 150 + dx, 100 + dy);
    }

    it('shifts the whole selection by one aligned offset while dragging', () => {
      const a = placed({ id: 'a', selected: true }, 10, 20);
      const b = placed({ id: 'b', selected: true }, 200, 20);
      placed({ id: 'target' }, -300, 200);

      drag(a, 0, 184);

      expect(a.point()).toEqual({ x: 10, y: 200 });
      expect(b.point()).toEqual({ x: 200, y: 200 });
      expect(alignment.guides().lines).not.toEqual([]);
    });

    it('keeps the aligned position and clears the guides on release', () => {
      const a = placed({ id: 'a' }, 10, 20);
      placed({ id: 'target' }, -300, 200);
      drag(a, 0, 184);

      pointer('pointerup', 150, 284);

      expect(a.point()).toEqual({ x: 10, y: 200 });
      expect(alignment.guides().lines).toEqual([]);
    });

    it('keeps a child inside its parent when the alignment lies outside', () => {
      const parent = placed({ id: 'parent' }, 100, 100);
      parent.width.set(300);
      parent.height.set(300);
      const child = placed({ id: 'child', parentId: 'parent' }, 0, 50);
      child.rawNode.extent!.set('parent');
      // Its right edge is at 95, just outside the parent's left wall at 100
      placed({ id: 'outside' }, -5, 600);

      drag(child, -3, 0);

      expect(child.point()).toEqual({ x: 0, y: 50 });
    });

    it('does not align a child with the edges of its parent', () => {
      const parent = placed({ id: 'parent' }, 100, 100);
      parent.width.set(300);
      parent.height.set(300);
      const child = placed({ id: 'child', parentId: 'parent' }, 20, 50);

      drag(child, -16, 0);

      expect(child.point()).toEqual({ x: 4, y: 50 });
    });

    it('aligns a child with the center of its parent', () => {
      const parent = placed({ id: 'parent' }, 100, 100);
      parent.width.set(300);
      parent.height.set(300);
      const child = placed({ id: 'child', parentId: 'parent' }, 20, 50);

      // Center 100 + 102 + 50 = 252 is next to the parent's center 250
      drag(child, 82, 0);

      expect(child.point()).toEqual({ x: 100, y: 50 });
    });

    it('applies the grid only to the axis without an alignment', () => {
      TestBed.inject(FlowSettingsService).bind({ snapGrid: signal([10, 10]) });
      const a = placed({ id: 'a' }, 10, 20);
      placed({ id: 'target' }, 500, 203);

      drag(a, 3, 181);

      expect(a.point()).toEqual({ x: 20, y: 203 });
    });

    it('moves freely while the bypass modifier is held', () => {
      const a = placed({ id: 'a' }, 10, 20);
      placed({ id: 'target' }, 0, 203);
      holdKey('Alt', 'AltLeft');

      drag(a, 3, 181);

      expect(a.point()).toEqual({ x: 13, y: 201 });
      expect(alignment.guides().lines).toEqual([]);
    });

    it('aligns again once the bypass modifier is released', () => {
      const a = placed({ id: 'a' }, 10, 20);
      placed({ id: 'target' }, 0, 203);
      holdKey('Alt', 'AltLeft');
      drag(a, 3, 181);

      releaseKey('Alt', 'AltLeft');
      pointer('pointermove', 153, 281);

      expect(a.point()).toEqual({ x: 13, y: 203 });
    });
  });
});
