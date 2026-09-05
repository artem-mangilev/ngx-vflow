import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FlowEntitiesService } from './services/flow-entities.service';
import { FlowSettingsService } from './services/flow-settings.service';
import { NodeRenderingService } from './services/node-rendering.service';
import { EdgeRenderingService } from './services/edge-rendering.service';
import { ViewportService } from './services/viewport.service';
import { EdgeChangesService } from './services/edge-changes.service';
import { NodesChangeService } from './services/node-changes.service';
import { NodeModel } from './models/node.model';
import { EdgeModel } from './models/edge.model';
import { HandleModel } from './models/handle.model';
import { createNode, Node } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { reparentNodes, removeNodes } from './utils/graph-operations';
import { ReferenceIdentityChecker } from './utils/identity-checker/reference-identity-checker';
import { addNodesToEdges } from './utils/add-nodes-to-edges';
import { createResizer } from './public-components/resizable/resizer';
import { FlowStatusService } from './services/flow-status.service';
import { ConnectionControllerDirective } from './directives/connection-controller.directive';
import { EdgeLabelComponent } from './components/edge-label/edge-label.component';
import { EdgeLabelModel } from './models/edge-label.model';
import { ConnectionModel } from './models/connection.model';
import { VflowComponent } from './components/vflow/vflow.component';

describe('Graph rendering and interaction regressions', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        EdgeRenderingService,
        ViewportService,
        EdgeChangesService,
        NodesChangeService,
        FlowStatusService,
      ],
    }),
  );

  function node(id: string) {
    return TestBed.runInInjectionContext(
      () => new NodeModel(createNode({ id, type: 'default', point: { x: 0, y: 0 } })),
    );
  }

  it('centers an HTML label immediately after its content changes, including at non-unit zoom', () => {
    const fixture = TestBed.createComponent(EdgeLabelComponent);
    fixture.componentRef.setInput('edgeModel', graph().edges[0]);
    fixture.componentRef.setInput('point', { x: 200, y: 100 });
    const container = document.createElement('div');
    container.style.cssText = 'position:relative; transform:scale(0.5); transform-origin:0 0';
    document.body.append(container);
    container.append(fixture.nativeElement);
    for (const text of ['Short', 'A significantly wider label that changed within one frame']) {
      fixture.componentRef.setInput('model', new EdgeLabelModel({ type: 'default', text }));
      fixture.detectChanges();
      const origin = container.getBoundingClientRect();
      const rect = fixture.nativeElement.querySelector('.edge-label-wrapper').getBoundingClientRect();
      expect(rect.left + rect.width / 2 - origin.left).toBeCloseTo(100, 1);
      expect(rect.top + rect.height / 2 - origin.top).toBeCloseTo(50, 1);
    }
    fixture.destroy();
    container.remove();
  });
  function handle(parent: NodeModel, type: 'source' | 'target') {
    const value = TestBed.runInInjectionContext(
      () => new HandleModel({ type, position: 'right', userOffsetX: 0, userOffsetY: 0 }, parent),
    );
    value.sync();
    parent.handles.update((values) => [...values, value]);
    return value;
  }
  function graph() {
    const nodes = ['a', 'b', 'c', 'd'].map(node);
    nodes.forEach((n, i) => handle(n, i % 2 ? 'target' : 'source'));
    const edges = [0, 2].map((i) =>
      TestBed.runInInjectionContext(
        () =>
          new EdgeModel(
            createEdge({
              id: String(i),
              source: nodes[i].rawNode.id,
              target: nodes[i + 1].rawNode.id,
              curve: 'straight',
            }),
          ),
      ),
    );
    const entities = TestBed.inject(FlowEntitiesService);
    entities.nodes.set(nodes);
    addNodesToEdges(nodes, edges);
    entities.edges.set(edges);
    return { nodes, edges, entities };
  }
  const settle = () => new Promise((resolve) => setTimeout(resolve, 40));

  it('emits edge selection changes for factory-created edges', async () => {
    const { edges } = graph();
    const events: unknown[] = [];
    const sub = TestBed.inject(EdgeChangesService).changes$.subscribe((v) => events.push(...v));
    TestBed.flushEffects();
    await settle();
    events.length = 0;
    edges[0].selected.set(true);
    TestBed.flushEffects();
    await settle();
    expect(events).toContain({ type: 'select', id: '0', selected: true });
    sub.unsubscribe();
  });

  it('emits detached when only one of two edges loses its handle', async () => {
    const { nodes, edges } = graph();
    const events: unknown[] = [];
    const sub = TestBed.inject(EdgeChangesService).changes$.subscribe((v) => events.push(...v));
    TestBed.flushEffects();
    await settle();
    events.length = 0;
    nodes[0].handles.set([]);
    TestBed.flushEffects();
    await settle();
    expect(edges[0].detached()).toBeTrue();
    expect(events).toContain({ type: 'detached', id: '0' });
    sub.unsubscribe();
  });

  it('clears the path after a handle is really removed without virtualization', () => {
    const { nodes, edges } = graph();
    expect(edges[0].path().path).not.toBe('');
    nodes[0].handles.set([]);
    expect(edges[0].detached()).toBeTrue();
    expect(edges[0].path().path).toBe('');
  });

  it('culls an already-measured edge wholly outside the viewport', () => {
    const { nodes, edges } = graph();
    const settings = TestBed.inject(FlowSettingsService);
    settings.optimization.update((v) => ({ ...v, virtualization: true }));
    edges[0].path();
    nodes.forEach((n) => n.point.set({ x: 100000, y: 100000 }));
    expect(TestBed.inject(NodeRenderingService).viewportNodes()).toEqual([]);
    expect(TestBed.inject(EdgeRenderingService).edges()).toEqual([]);
  });

  it('keeps crossing paths after virtual unmount, culls them on pan, and restores them on return', () => {
    const { nodes, edges } = graph();
    const settings = TestBed.inject(FlowSettingsService);
    settings.computedFlowWidth.set(400);
    settings.computedFlowHeight.set(300);
    settings.optimization.update((value) => ({ ...value, virtualization: true }));
    nodes[0].point.set({ x: -200, y: 0 });
    nodes[1].point.set({ x: 800, y: 0 });
    const rendering = TestBed.inject(EdgeRenderingService);
    const viewport = TestBed.inject(ViewportService).readableViewport;
    expect(rendering.edges()).toContain(edges[0]);
    for (const node of nodes.slice(0, 2)) {
      node.virtualized.set(true);
      node.handles.set([]);
    }
    expect(edges[0].detached()).toBeFalse();
    expect(rendering.edges()).toContain(edges[0]);
    viewport.set({ x: 0, y: 1000, zoom: 1 });
    expect(rendering.edges()).not.toContain(edges[0]);
    viewport.set({ x: 0, y: 0, zoom: 1 });
    expect(rendering.edges()).toContain(edges[0]);
    viewport.set({ x: 0, y: 0, zoom: 0.1 });
    expect(rendering.edges()).toEqual([]);
    nodes[0].virtualized.set(false);
    expect(edges[0].detached()).toBeTrue();
  });

  it('restores actual node views and edges after panning without emitting detached notifications', async () => {
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'a', type: 'default', point: { x: 10, y: 20 } }),
      createNode({ id: 'b', type: 'default', point: { x: 250, y: 20 } }),
    ]);
    fixture.componentRef.setInput('edges', [createEdge({ id: 'a-b', source: 'a', target: 'b' })]);
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    await fixture.whenStable();
    const events: unknown[] = [];
    const subscription = fixture.componentInstance.edgesChange$.subscribe((changes) => events.push(...changes));
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.vflow-node').length).toBe(2);
    expect(host.querySelectorAll('svg[edge]').length).toBe(1);
    fixture.componentInstance.panTo({ x: 1000, y: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelectorAll('.vflow-node').length).toBe(0);
    expect(host.querySelectorAll('svg[edge]').length).toBe(0);
    fixture.componentInstance.panTo({ x: 0, y: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    await settle();
    expect(host.querySelectorAll('.vflow-node').length).toBe(2);
    expect(host.querySelectorAll('svg[edge]').length).toBe(1);
    expect(events).not.toContain({ type: 'detached', id: 'a-b' });
    subscription.unsubscribe();
  });

  it('uses the whole custom curve, including a detour away from its endpoints', () => {
    const { nodes, edges } = graph();
    const settings = TestBed.inject(FlowSettingsService);
    settings.computedFlowWidth.set(400);
    settings.computedFlowHeight.set(300);
    settings.optimization.update((value) => ({ ...value, virtualization: true }));
    nodes.forEach((node) => node.point.set({ x: -1000, y: -1000 }));
    edges[0].curve.set(() => ({ path: 'M -1000,-1000 Q 2000,1500 -900,-1000' }));
    const rendering = TestBed.inject(EdgeRenderingService);
    expect(rendering.edges()).toContain(edges[0]);
    edges[0].curve.set(() => ({ path: 'M -1000,-1000 l 100,0' }));
    expect(rendering.edges()).not.toContain(edges[0]);
  });

  for (const virtualizedIndex of [0, 1]) {
    it(`preserves a floating edge with only endpoint ${virtualizedIndex} virtualized`, () => {
      const { nodes, edges } = graph();
      const edge = edges[0];
      edge.floating.set(true);
      const path = edge.path().path;
      expect(path).not.toBe('');
      nodes[virtualizedIndex].virtualized.set(true);
      nodes[virtualizedIndex].handles.set([]);
      expect(edge.detached()).toBeFalse();
      expect(edge.path().path).toBe(path);
      nodes[1 - virtualizedIndex].handles.set([]);
      expect(edge.detached()).toBeTrue();
      expect(edge.path().path).toBe('');
    });
  }

  it('preserves rendered position when reparentNodes adds an omitted parentId signal', () => {
    const parent = createNode({ id: 'parent', type: 'default', point: { x: 100, y: 0 } });
    const child: Node = { id: 'child', type: 'default', point: signal({ x: 150, y: 0 }) };
    const entities = TestBed.inject(FlowEntitiesService);
    const models = TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes([parent, child], []));
    entities.nodes.set(models);
    expect(models[1].globalPoint()).toEqual({ x: 150, y: 0 });
    const next = reparentNodes([{ id: 'child', parentId: 'parent' }], [parent, child]);
    entities.nodes.set(TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes(next, models)));
    expect(child.parentId!()).toBe('parent');
    expect(entities.nodes()[1].globalPoint()).toEqual({ x: 150, y: 0 });
  });

  it('does not report position changes for stationary selected nodes', async () => {
    const { nodes } = graph();
    nodes[1].selected.set(true);
    const events: any[] = [];
    const sub = TestBed.inject(NodesChangeService).changes$.subscribe((v) => events.push(...v));
    TestBed.flushEffects();
    await settle();
    events.length = 0;
    nodes[0].point.set({ x: 20, y: 0 });
    TestBed.flushEffects();
    await settle();
    expect(events.filter((v) => v.type === 'position').map((v) => v.id)).toEqual(['a']);
    sub.unsubscribe();
  });

  it('completes connectEnd without requiring a connect subscriber', () => {
    const controller = TestBed.runInInjectionContext(() => new ConnectionControllerDirective());
    const events: unknown[] = [];
    const sub = controller.connectEnd.subscribe((value) => events.push(value));
    const source = handle(node('source'), 'source');
    const target = handle(node('target'), 'target');
    controller.startConnection(source);
    TestBed.flushEffects();
    controller.validateConnection(target);
    TestBed.flushEffects();
    controller.endConnection();
    TestBed.flushEffects();
    expect(events.length).toBe(1);
    expect(TestBed.inject(FlowStatusService).status().state).toBe('idle');
    sub.unsubscribe();
  });

  it('validates release once regardless of subscriber count and completes reconnect without listeners', () => {
    const controller = TestBed.runInInjectionContext(() => new ConnectionControllerDirective());
    const { nodes, edges } = graph();
    const source = nodes[0].handles()[0];
    const target = nodes[1].handles()[0];
    const validator = jasmine.createSpy('application validator').and.returnValue(true);
    TestBed.inject(FlowEntitiesService).connection.set(new ConnectionModel({ validator }));
    const requests: unknown[] = [];
    controller.connect.subscribe((value) => requests.push(value));
    controller.connect.subscribe((value) => requests.push(value));
    controller.startConnection(source);
    TestBed.flushEffects();
    controller.validateConnection(target);
    TestBed.flushEffects();
    validator.calls.reset();
    controller.endConnection();
    TestBed.flushEffects();
    expect(validator).toHaveBeenCalledTimes(1);
    expect(requests.length).toBe(2);
    expect(TestBed.inject(FlowStatusService).status().state).toBe('idle');
    controller.startReconnection(source, edges[0]);
    TestBed.flushEffects();
    controller.validateConnection(target);
    TestBed.flushEffects();
    controller.endConnection();
    TestBed.flushEffects();
    expect(TestBed.inject(FlowStatusService).status().state).toBe('idle');
  });

  it('reports the last accepted size at resizeEnd after a rejected move', () => {
    const model = node('resize');
    const element = document.createElement('div');
    document.body.append(element);
    const end = jasmine.createSpy('resizeEnd');
    const resizer = createResizer({
      domNode: element,
      getStoreItems: () => ({
        model,
        viewport: { x: 0, y: 0, zoom: 1 },
        snapGrid: [1, 1],
        nodeOrigin: [0, 0],
        paneDomNode: element,
      }),
      onChange: (change) => {
        if (change.width !== undefined) model.width.set(change.width);
      },
    });
    resizer.update({
      controlPosition: 'right',
      boundaries: { minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity },
      keepAspectRatio: false,
      shouldResize: (_, size) => size.width <= 110,
      onResizeEnd: end,
    });
    const mouse = (type: string, x: number) =>
      new MouseEvent(type, {
        clientX: x,
        clientY: 25,
        bubbles: true,
        view: window,
        buttons: type === 'mouseup' ? 0 : 1,
      });
    element.dispatchEvent(mouse('mousedown', 100));
    window.dispatchEvent(mouse('mousemove', 110));
    window.dispatchEvent(mouse('mousemove', 120));
    window.dispatchEvent(mouse('mouseup', 120));
    expect(model.width()).toBe(110);
    expect(end.calls.mostRecent().args[1].width).toBe(110);
    resizer.destroy();
    element.remove();
  });

  it('stops observing a model after the node is removed from the graph', () => {
    const point = signal({ x: 0, y: 0 });
    const read = jasmine.createSpy('removed node point').and.callFake(() => point());
    const observedPoint = Object.assign(read, point);
    const raw: Node = { id: 'removed', type: 'default', point: observedPoint };
    const entities = TestBed.inject(FlowEntitiesService);
    entities.nodes.set(TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes([raw], [])));
    TestBed.flushEffects();
    entities.nodes.set(TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes([], entities.nodes())));
    TestBed.flushEffects();
    read.calls.reset();
    point.set({ x: 5, y: 0 });
    TestBed.flushEffects();
    expect(read).not.toHaveBeenCalled();
  });

  it('measures validEdges scaling and batch removal scaling', () => {
    const entities = TestBed.inject(FlowEntitiesService);
    for (const count of [1000, 5000, 10000]) {
      const nodes = Array.from({ length: count }, (_, i) => ({ rawNode: { id: String(i) } }) as NodeModel);
      const edges = nodes.map((n) => ({ source: () => n, target: () => n }) as unknown as EdgeModel);
      const samples = [];
      for (let iteration = 0; iteration < 7; iteration++) {
        entities.nodes.set([...nodes]);
        entities.edges.set(edges);
        const start = performance.now();
        expect(entities.validEdges().length).toBe(count);
        samples.push(performance.now() - start);
      }
      const rawNodes = nodes.map((n) => ({ id: n.rawNode.id, type: 'default', point: signal({ x: 0, y: 0 }) }) as Node);
      const start = performance.now();
      expect(
        removeNodes(
          rawNodes.map((n) => n.id),
          { nodes: rawNodes, edges: [] },
        ).nodes,
      ).toEqual([]);
      console.log(
        `AUDIT BENCH count=${count} validEdges median=${samples.sort((a, b) => a - b)[3].toFixed(2)}ms removeNodes=${(performance.now() - start).toFixed(2)}ms`,
      );
    }
  });
});
