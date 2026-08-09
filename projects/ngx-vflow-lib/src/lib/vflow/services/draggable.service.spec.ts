import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
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
    isActiveAction(action: 'selection' | 'multiSelection') {
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
        provideExperimentalZonelessChangeDetection(),
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

  function createModel(params: {
    id: string;
    type?: 'default' | 'default-group';
    selected?: boolean;
    draggable?: boolean;
    parentId?: string;
  }) {
    const type = params.type ?? 'default';
    const nodeConfig: any = {
      id: params.id,
      type,
      point: { x: 0, y: 0 },
      selected: params.selected ?? false,
      draggable: params.draggable ?? true,
      parentId: params.parentId,
    };

    if (type === 'default') {
      nodeConfig.text = params.id;
    }

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

  function dispatchMouse(target: EventTarget, type: 'mousedown' | 'mousemove' | 'mouseup', x: number, y: number) {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        view: window,
        button: 0,
        clientX: x,
        clientY: y,
      }),
    );
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
    const group = createModel({ id: 'group', type: 'default-group' });
    const dragFilter = (service as any).getDragBehavior(group).filter();
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(dragFilter({ target } as unknown as Event)).toBe(false);
  });

  it('should keep regular node drag available when selection shortcut is active', () => {
    const node = createModel({ id: 'node' });
    const dragFilter = (service as any).getDragBehavior(node).filter();
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(dragFilter({ target } as unknown as Event)).toBe(true);
  });

  it('should reject drag for non-primary mouse buttons (d3-drag default)', () => {
    const node = createModel({ id: 'node' });
    const dragFilter = (service as any).getDragBehavior(node).filter();

    expect(dragFilter(new MouseEvent('mousedown', { button: 1, bubbles: true, clientX: 0, clientY: 0 }))).toBe(false);
    expect(dragFilter(new MouseEvent('mousedown', { button: 2, bubbles: true, clientX: 0, clientY: 0 }))).toBe(false);
  });

  it('should reject drag when ctrlKey is set (d3-drag default)', () => {
    const node = createModel({ id: 'node' });
    const dragFilter = (service as any).getDragBehavior(node).filter();

    expect(
      dragFilter(new MouseEvent('mousedown', { button: 0, ctrlKey: true, bubbles: true, clientX: 0, clientY: 0 })),
    ).toBe(false);
  });

  it('should allow drag for primary mouse button', () => {
    const node = createModel({ id: 'node' });
    const dragFilter = (service as any).getDragBehavior(node).filter();

    expect(dragFilter(new MouseEvent('mousedown', { button: 0, bubbles: true, clientX: 0, clientY: 0 }))).toBe(true);
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
