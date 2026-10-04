import { TestBed } from '@angular/core/testing';
import { EdgeModel } from './edge.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { Curve, Edge, createEdge } from '../interfaces/edge.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { signal } from '@angular/core';

function mockRect(element: Element, rect: { left: number; top: number; width: number; height: number }): void {
  const { left, top, width, height } = rect;

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

function createHandle(
  type: 'source' | 'target' | 'any',
  position: 'left' | 'right',
  parentNode: NodeModel,
  nodeRect: { left: number; top: number; width: number; height: number },
  handleRect: { left: number; top: number; width: number; height: number },
) {
  const anchor = document.createElement('div');
  const nodeElement = document.createElement('div');
  const handleElement = document.createElement('div');

  mockRect(anchor, nodeRect);
  mockRect(nodeElement, nodeRect);
  mockRect(handleElement, handleRect);

  parentNode.nodeElement.set(nodeElement);

  anchor.append(handleElement);

  const handle = TestBed.runInInjectionContext(
    () => new HandleModel({ type: signal(type), position: signal(position), element: handleElement }, parentNode),
  );

  handle.sync();

  return handle;
}

describe('EdgeModel', () => {
  let model: EdgeModel;
  let settingsService: FlowSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, NodeRenderingService, ViewportService],
    });

    settingsService = TestBed.inject(FlowSettingsService);

    model = TestBed.runInInjectionContext(
      () =>
        new EdgeModel(
          createEdge({
            id: '1 -> 2',
            source: '1',
            target: '2',
            curve: 'straight',
          }),
        ),
    );

    model.source.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '1',

              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );
    model.target.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '2',

              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );

    const nodeRect = { left: 100, top: 200, width: 0, height: 0 };

    model.source()!.handles.set([
      createHandle('source', 'right', model.source()!, nodeRect, {
        left: 86.5,
        top: 193,
        width: 14,
        height: 14,
      }),
    ]);

    model.target()!.handles.set([
      createHandle('target', 'left', model.target()!, nodeRect, {
        left: 99.5,
        top: 193,
        width: 14,
        height: 14,
      }),
    ]);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  /**
   * @todo add more path tests
   */
  it('should provide path', () => {
    expect(model.path().path).toBe('M 15,15L 15,15');
  });

  it('should set detached === true if there no source', () => {
    model.source.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target', () => {
    model.target.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no source handle', () => {
    model.source()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target handle', () => {
    model.target()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === false if source and target exists and their source and target handle also exists', () => {
    expect(model.detached()).toEqual(false);
  });

  it('should serve either role with a handle of type any and none with a handle of the other role', () => {
    const nodeRect = { left: 100, top: 200, width: 0, height: 0 };
    const handleRect = { left: 86.5, top: 193, width: 14, height: 14 };
    model.target()!.handles.set([createHandle('source', 'right', model.target()!, nodeRect, handleRect)]);

    expect(model.targetHandle()).toBeNull();

    model.target()!.handles.set([createHandle('any', 'right', model.target()!, nodeRect, handleRect)]);

    expect(model.targetHandle()).not.toBeNull();
  });

  it('should pass node geometry and the marker inset to a custom curve', () => {
    const curve = vi.fn().mockReturnValue({ path: 'M 0,0' });
    model.edge.curve!.set(curve);
    model.edge.markers!.set({ end: { type: 'arrow-closed', width: 20 } });
    model.path();

    const params = curve.mock.lastCall![0];
    expect(params.sourceNode).toEqual({ id: '1', x: 15, y: 15, width: 0, height: 0 });
    expect(params.targetNode).toEqual({ id: '2', x: 15, y: 15, width: 0, height: 0 });
    // A closed arrow of 20 flow units: the path ends 7 units before the tip, at the base of the arrowhead.
    expect(params.markerInset).toEqual({ start: 0, end: 7 });
    // The left target handle point moves away from the node by the inset.
    expect(params.targetPoint.x).toBe(params.sourcePoint.x - 7);

    model.edge.markers!.set({ end: { type: 'arrow', width: 20 } });
    model.path();

    // An open arrow has no fill to hide the line, so the path runs through it to just short of the tip.
    expect(curve.mock.lastCall![0].markerInset).toEqual({ start: 0, end: 2 });
  });

  it('should share one marker element between equal markers and inset a declared shape', () => {
    const curve = vi.fn().mockReturnValue({ path: 'M 0,0' });
    model.edge.curve!.set(curve);
    model.edge.markers!.set({ start: 'arrow-closed', end: {} });
    model.path();

    // The type alone, the empty marker and the default type are the same marker.
    expect(model.markerStartUrl()).toBe(model.markerEndUrl());
    expect(model.markerStartUrl()).toMatch(/^url\(#-?\d+\)$/);

    TestBed.inject(FlowEntitiesService).markerShapes.set(
      new Map([['diamond', { template: null as never, inset: 10 }]]),
    );
    model.edge.markers!.set({ start: { type: 'diamond', width: 20 }, end: { type: 'arrow', width: 20 } });
    model.path();

    expect(curve.mock.lastCall![0].markerInset).toEqual({ start: 10, end: 2 });
  });

  it('should resolve selection and focus defaults reactively', () => {
    expect(model.selectable()).toBe(true);
    expect(model.focusable()).toBe(true);

    settingsService.edgesSelectable.set(false);
    settingsService.edgesFocusable.set(false);

    expect(model.selectable()).toBe(false);
    expect(model.focusable()).toBe(false);
  });

  it('should let explicit capability overrides win over global settings', () => {
    const explicitModel = TestBed.runInInjectionContext(
      () =>
        new EdgeModel(
          createEdge({
            id: 'explicit',
            source: '1',
            target: '2',
            selectable: false,
            focusable: true,
          }),
        ),
    );

    settingsService.edgesSelectable.set(true);
    settingsService.edgesFocusable.set(false);

    expect(explicitModel.selectable()).toBe(false);
    expect(explicitModel.focusable()).toBe(true);
  });

  it('should keep inherited capabilities absent when factories materialize defaults', () => {
    const created = createEdge({ id: 'factory', source: '1', target: '2' });

    expect(created.selectable).toBeUndefined();
    expect(created.focusable).toBeUndefined();
  });

  describe('signals added to the edge object later', () => {
    const make = () => {
      const edge: Edge = { id: 'late', source: '1', target: '2' };
      const entities = TestBed.inject(FlowEntitiesService);
      const late = TestBed.runInInjectionContext(() => new EdgeModel(edge));
      entities.edges.update((edges) => [...edges, late]);
      return { edge, late, passNewArray: () => entities.edges.update((edges) => [...edges]) };
    };

    it('reads them once the application passes a new array', () => {
      const { edge, late, passNewArray } = make();
      expect([late.curve(), late.reconnectable(), late.interactionWidth(), late.markers()]).toEqual([
        'bezier',
        false,
        20,
        {},
      ]);
      expect([late.selectable(), late.focusable()]).toEqual([true, true]);
      expect(late.context.$implicit.data()).toEqual({});

      edge.curve = signal<Curve>('straight');
      edge.reconnectable = signal<boolean | 'source' | 'target'>('target');
      edge.interactionWidth = signal(0);
      edge.markers = signal({ end: 'arrow' as const });
      edge.selectable = signal(false);
      edge.focusable = signal(false);
      edge.data = signal({ title: 'Late' });
      expect(late.curve()).toBe('bezier');

      passNewArray();
      expect([late.curve(), late.reconnectable(), late.interactionWidth(), late.markers()]).toEqual([
        'straight',
        'target',
        0,
        { end: 'arrow' },
      ]);
      expect([late.selectable(), late.focusable()]).toEqual([false, false]);
      expect(late.context.$implicit.data()).toEqual({ title: 'Late' });
    });

    it('selects through the application signal, which wins over the selection held by the model', () => {
      const { edge, late, passNewArray } = make();
      late.selected.set(true);
      expect(Object.keys(edge)).toEqual(['id', 'source', 'target']);

      edge.selected = signal(false);
      passNewArray();
      expect(late.selected()).toBe(false);
      expect(late.context.$implicit.selected()).toBe(false);

      late.selected.set(true);
      expect(edge.selected()).toBe(true);
    });
  });
});
