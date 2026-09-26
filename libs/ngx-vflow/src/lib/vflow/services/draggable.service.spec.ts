import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DraggableService } from './draggable.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowStatusService } from './flow-status.service';
import { ViewportService } from './viewport.service';
import { NodeRenderingService } from './node-rendering.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { KeyboardService } from './keyboard.service';
import { ResizeObserverService } from './resize-observer.service';
import { dispatchPointer, pointerEvent } from '../gestures/pointer-events.testing';

describe('DraggableService', () => {
  let service: DraggableService;
  let entitiesService: FlowEntitiesService;
  let viewportService: ViewportService;
  let observedPane: Element | null;
  let paneResizeCallback: ((entry: ResizeObserverEntry) => void) | null;
  let dragPanes: HTMLElement[];
  let panePositionCallback: IntersectionObserverCallback | null;
  let intersectionObserverMock: {
    observe: jasmine.Spy;
    disconnect: jasmine.Spy;
  };
  let originalIntersectionObserver: typeof IntersectionObserver;
  const resizeObserverMock = {
    addObserver(element: Element, callback: (entry: ResizeObserverEntry) => void) {
      observedPane = element;
      paneResizeCallback = callback;
    },
    removeObserver(element: Element, callback: (entry: ResizeObserverEntry) => void) {
      if (observedPane === element && paneResizeCallback === callback) {
        observedPane = null;
        paneResizeCallback = null;
      }
    },
  };
  const keyboardServiceMock = {
    selectionActive: false,
    isActiveModifier(action: 'selection' | 'multiSelection') {
      return action === 'selection' ? this.selectionActive : false;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DraggableService,
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        ViewportService,
        NodeRenderingService,
        { provide: ResizeObserverService, useValue: resizeObserverMock },
        {
          provide: KeyboardService,
          useValue: keyboardServiceMock,
        },
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(DraggableService);
    entitiesService = TestBed.inject(FlowEntitiesService);
    viewportService = TestBed.inject(ViewportService);
    keyboardServiceMock.selectionActive = false;
    observedPane = null;
    paneResizeCallback = null;
    dragPanes = [];
    panePositionCallback = null;
    intersectionObserverMock = {
      observe: jasmine.createSpy('observe'),
      disconnect: jasmine.createSpy('disconnect'),
    };
    originalIntersectionObserver = window.IntersectionObserver;
    class IntersectionObserverMock {
      public readonly root = null;
      public readonly rootMargin = '';
      public readonly thresholds = [1];

      constructor(callback: IntersectionObserverCallback) {
        panePositionCallback = callback;
      }

      public observe(target: Element) {
        intersectionObserverMock.observe(target);
      }

      public disconnect() {
        intersectionObserverMock.disconnect();
      }

      public unobserve() {}

      public takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
  });

  afterEach(() => {
    dragPanes.forEach((pane) => pane.remove());
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: originalIntersectionObserver,
    });
  });

  function createModel(params: { id: string; selected?: boolean; draggable?: boolean; parentId?: string }) {
    const nodeConfig: any = {
      id: params.id,
      point: { x: 0, y: 0 },
      selected: params.selected ?? false,
      draggable: params.draggable ?? true,
      parentId: params.parentId,
    };

    const model = TestBed.runInInjectionContext(() => new NodeModel(createNode(nodeConfig)));

    entitiesService.nodes.update((nodes) => [...nodes, model]);

    return model;
  }

  function createDragSurface(...paneRects: DOMRect[]) {
    const pane = document.createElement('div');
    pane.classList.add('vflow-pane');
    const nodesLayer = document.createElement('div');
    const element = document.createElement('div');
    nodesLayer.append(element);
    pane.append(nodesLayer);
    document.body.append(pane);
    dragPanes.push(pane);

    const getPaneRect = spyOn(pane, 'getBoundingClientRect').and.returnValues(...paneRects);

    return { pane, element, getPaneRect };
  }

  const pointerTypes = { mousedown: 'pointerdown', mousemove: 'pointermove', mouseup: 'pointerup' } as const;

  function dispatchMouse(target: EventTarget, type: 'mousedown' | 'mousemove' | 'mouseup', x: number, y: number) {
    dispatchPointer(target, pointerTypes[type], { x, y });
  }

  function press(target: EventTarget | null, init: { button?: number; ctrlKey?: boolean } = {}) {
    const event = pointerEvent('pointerdown', { x: 0, y: 0, ...init });
    Object.defineProperty(event, 'target', { value: target });
    return event;
  }

  function dragFilter(model: NodeModel): (event: PointerEvent) => boolean {
    return (service as any).dragFilter(model);
  }

  function startNodeDrag(...paneRects: DOMRect[]) {
    const model = createModel({ id: 'node' });
    model.setPoint({ x: 10, y: 20 });
    const dragSurface = createDragSurface(...paneRects);

    service.enable(dragSurface.element, model);
    dispatchMouse(dragSurface.element, 'mousedown', 150, 100);

    return { model, ...dragSurface };
  }

  function dispatchPanePosition(rect: DOMRectReadOnly, pane: Element) {
    panePositionCallback?.(
      [{ boundingClientRect: rect, target: pane } as IntersectionObserverEntry],
      intersectionObserverMock as unknown as IntersectionObserver,
    );
  }

  it('delays node drag until the client-space threshold is crossed at non-unit zoom', () => {
    TestBed.inject(FlowSettingsService).nodeDragThreshold.set(10);
    viewportService.readableViewport.set({ x: 0, y: 0, zoom: 2 });
    const { model } = startNodeDrag(new DOMRect(0, 0, 400, 300));
    const status = TestBed.inject(FlowStatusService);
    expect(status.status().state).toBe('idle');
    dispatchMouse(window, 'mousemove', 156, 100);
    expect(model.point()).toEqual({ x: 10, y: 20 });
    expect(status.status().state).toBe('idle');
    dispatchMouse(window, 'mousemove', 162, 100);
    expect(model.point()).toEqual({ x: 16, y: 20 });
    expect(status.status().state).toBe('node-drag-start');
    dispatchMouse(window, 'mouseup', 162, 100);
  });

  it('does not emit node drag end for a release below the threshold', () => {
    TestBed.inject(FlowSettingsService).nodeDragThreshold.set(10);
    const { model } = startNodeDrag(new DOMRect(0, 0, 400, 300));
    dispatchMouse(window, 'mouseup', 150, 100);
    expect(model.point()).toEqual({ x: 10, y: 20 });
    expect(TestBed.inject(FlowStatusService).status().state).toBe('idle');
  });

  it('should not include selected child when selected parent is dragged', () => {
    const parent = createModel({ id: 'parent', selected: true });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([parent]);
  });

  it('should include selected child when parent is not selected', () => {
    createModel({ id: 'parent', selected: false });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([child]);
  });

  it('should keep only top selected ancestor in deep hierarchy', () => {
    const grandParent = createModel({ id: 'grand-parent', selected: true });
    createModel({ id: 'parent', selected: true, parentId: 'grand-parent' });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });
    const standalone = createModel({ id: 'standalone', selected: true });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([grandParent, standalone]);
  });

  it('should keep normal multi-select behavior for unrelated nodes', () => {
    const nodeA = createModel({ id: 'node-a', selected: true });
    const nodeB = createModel({ id: 'node-b', selected: true });

    const dragNodes = (service as any).getDragNodes(nodeA) as NodeModel[];

    expect(dragNodes).toEqual([nodeA, nodeB]);
  });

  it('should block group drag when selection shortcut is active', () => {
    const group = createModel({ id: 'group' });
    createModel({ id: 'member', parentId: 'group' });
    const filter = dragFilter(group);
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(filter(press(target))).toBe(false);
  });

  it('should keep regular node drag available when selection shortcut is active', () => {
    const node = createModel({ id: 'node' });
    const filter = dragFilter(node);
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(filter(press(target))).toBe(true);
  });

  it('should reject drag for non-primary mouse buttons (primary button only)', () => {
    const filter = dragFilter(createModel({ id: 'node' }));

    expect(filter(press(null, { button: 1 }))).toBe(false);
    expect(filter(press(null, { button: 2 }))).toBe(false);
  });

  it('should reject drag when ctrlKey is set (context menu on macOS)', () => {
    const filter = dragFilter(createModel({ id: 'node' }));

    expect(filter(press(null, { ctrlKey: true }))).toBe(false);
  });

  it('should allow drag for primary mouse button with a null target', () => {
    const filter = dragFilter(createModel({ id: 'node' }));
    const event = pointerEvent('pointerdown', { x: 0, y: 0 });

    expect(event.target).toBeNull();
    expect(filter(event)).toBe(true);
  });

  it('suppresses the click after a drag past the threshold and keeps it below', async () => {
    TestBed.inject(FlowSettingsService).nodeDragThreshold.set(10);
    const { element } = startNodeDrag(new DOMRect(0, 0, 400, 300));
    let clicks = 0;
    element.addEventListener('click', () => clicks++);
    dispatchMouse(window, 'mousemove', 155, 100);
    dispatchMouse(window, 'mouseup', 155, 100);
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toBe(1);

    dispatchMouse(element, 'mousedown', 150, 100);
    dispatchMouse(window, 'mousemove', 175, 100);
    dispatchMouse(window, 'mouseup', 175, 100);
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toBe(1);
    await new Promise((resolve) => setTimeout(resolve));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toBe(2);
  });

  it('ends the drag when the browser cancels the pointer and when the window loses focus', () => {
    const status = TestBed.inject(FlowStatusService);
    const { model, element } = startNodeDrag(new DOMRect(0, 0, 400, 300), new DOMRect(0, 0, 400, 300));
    dispatchMouse(window, 'mousemove', 160, 100);
    dispatchPointer(window, 'pointercancel', { x: 160, y: 100 });
    expect(status.status().state).toBe('node-drag-end');
    expect(model.dragging()).toBeFalse();
    expect(model.point()).toEqual({ x: 20, y: 20 });

    dispatchMouse(element, 'mousedown', 150, 100);
    dispatchMouse(window, 'mousemove', 170, 100);
    window.dispatchEvent(new Event('blur'));
    expect(model.dragging()).toBeFalse();
    dispatchMouse(window, 'mousemove', 190, 100);
    expect(model.point()).toEqual({ x: 40, y: 20 });
  });

  it('ends a mouse drag whose release happened out of sight', () => {
    const status = TestBed.inject(FlowStatusService);
    startNodeDrag(new DOMRect(0, 0, 400, 300));
    dispatchMouse(window, 'mousemove', 160, 100);
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 0 }));
    expect(status.status().state).toBe('node-drag-end');
  });

  it('should reject drag from a descendant of a no-drag element', () => {
    const node = createModel({ id: 'node' });
    const filter = dragFilter(node);
    const noDragElement = document.createElement('div');
    const target = document.createElement('span');
    noDragElement.setAttribute('data-vflow-no-drag', '');
    noDragElement.append(target);

    expect(filter(press(target))).toBe(false);
  });

  it('should reject drag from inside a handle unless a drag handle inside it is the closer ancestor', () => {
    const node = createModel({ id: 'node' });
    const filter = dragFilter(node);
    const handle = document.createElement('div');
    handle.classList.add('vflow-handle');
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('vflow-drag-handle');
    const body = document.createElement('span');
    const title = document.createElement('span');
    handle.append(dragHandle, body);
    dragHandle.append(title);

    expect(filter(press(body))).toBe(false);
    node.dragHandlesCount.set(1);
    expect(filter(press(body))).toBe(false);
    expect(filter(press(title))).toBe(true);
  });

  it('should allow drag from a valid drag handle target', () => {
    const node = createModel({ id: 'node' });
    const filter = dragFilter(node);
    const target = document.createElement('div');
    target.classList.add('vflow-drag-handle');
    node.dragHandlesCount.set(1);

    expect(filter(press(target))).toBe(true);
  });

  it('should reuse pane geometry while dragging at non-unit zoom', () => {
    viewportService.readableViewport.set({ x: 0, y: 0, zoom: 1.6245 });
    const { model, getPaneRect } = startNodeDrag(new DOMRect(100, 50, 800, 600));
    expect(model.point()).toEqual({ x: 10, y: 20 });
    dispatchMouse(window, 'mousemove', 180, 120);
    dispatchMouse(window, 'mousemove', 210, 140);
    dispatchMouse(window, 'mouseup', 210, 140);

    expect(model.point().x).toBeCloseTo(46.93, 2);
    expect(model.point().y).toBeCloseTo(44.62, 2);
    expect(getPaneRect).toHaveBeenCalledTimes(1);
  });

  it('should refresh pane geometry after root resize and document scroll', () => {
    const { model, pane, getPaneRect } = startNodeDrag(
      new DOMRect(100, 50, 800, 600),
      new DOMRect(120, 50, 700, 600),
      new DOMRect(130, 60, 700, 600),
    );

    expect(observedPane).toBe(pane);
    paneResizeCallback?.({
      target: pane,
      contentRect: new DOMRect(0, 0, 800, 600),
    } as unknown as ResizeObserverEntry);
    expect(getPaneRect).toHaveBeenCalledTimes(1);

    paneResizeCallback?.({
      target: pane,
      contentRect: new DOMRect(0, 0, 700, 600),
    } as unknown as ResizeObserverEntry);
    dispatchMouse(window, 'mousemove', 210, 140);
    expect(model.point()).toEqual({ x: 50, y: 60 });

    document.dispatchEvent(new Event('scroll'));
    dispatchMouse(window, 'mousemove', 220, 150);
    dispatchMouse(window, 'mouseup', 220, 150);

    expect(model.point()).toEqual({ x: 50, y: 60 });
    expect(getPaneRect).toHaveBeenCalledTimes(3);
    expect(observedPane).toBeNull();
  });

  it('should refresh pane geometry after a position-only document layout change', () => {
    const { model, pane, getPaneRect } = startNodeDrag(new DOMRect(100, 50, 800, 600), new DOMRect(120, 50, 800, 600));

    dispatchPanePosition(new DOMRect(120, 50, 800, 600), pane);
    dispatchMouse(window, 'mousemove', 210, 140);
    dispatchMouse(window, 'mouseup', 210, 140);

    expect(model.point()).toEqual({ x: 50, y: 60 });
    expect(getPaneRect).toHaveBeenCalledTimes(1);
    expect(intersectionObserverMock.disconnect).toHaveBeenCalled();
  });

  it('should ignore an unchanged pane position across multiple drag steps', () => {
    const { model, pane, getPaneRect } = startNodeDrag(new DOMRect(100, 50, 800, 600));

    dispatchPanePosition(new DOMRect(100, 50, 800, 600), pane);
    dispatchMouse(window, 'mousemove', 180, 120);
    dispatchMouse(window, 'mousemove', 210, 140);
    dispatchMouse(window, 'mouseup', 210, 140);

    expect(model.point()).toEqual({ x: 70, y: 60 });
    expect(getPaneRect).toHaveBeenCalledTimes(1);
  });

  it('should keep cached pane geometry while the viewport pans and zooms', () => {
    const { model, getPaneRect } = startNodeDrag(new DOMRect(100, 50, 800, 600));

    viewportService.readableViewport.set({ x: 20, y: 0, zoom: 1 });
    TestBed.flushEffects();
    dispatchMouse(window, 'mousemove', 210, 140);
    expect(model.point()).toEqual({ x: 50, y: 60 });

    viewportService.readableViewport.set({ x: 20, y: 0, zoom: 2 });
    TestBed.flushEffects();
    dispatchMouse(window, 'mousemove', 300, 210);
    dispatchMouse(window, 'mouseup', 300, 210);

    expect(model.point()).toEqual({ x: 50, y: 50 });
    expect(getPaneRect).toHaveBeenCalledTimes(1);
  });
});
