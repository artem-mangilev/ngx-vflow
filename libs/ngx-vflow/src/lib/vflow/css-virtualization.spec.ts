import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode, Node } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { FlowEntitiesService } from './services/flow-entities.service';
import { SelectionService } from './services/selection.service';
import { NodeRenderingService } from './services/node-rendering.service';
import { EdgeRenderingService } from './services/edge-rendering.service';
import { FlowStatusService } from './services/flow-status.service';
import { CustomNodeComponent } from './public-components/custom-node/custom-node.component';
import { HandleComponent } from './public-components/handle/handle.component';
import { MiniMapComponent } from './public-components/minimap/minimap.component';
import { NodeToolbarComponent } from './public-components/node-toolbar/node-toolbar.component';

@Component({
  template: `<div [style.width.px]="width()" [style.height.px]="height()">
    <input [value]="draft" (input)="draft = $any($event.target).value" />
    <handle type="target" position="left" /><handle type="source" position="right" />
  </div>`,
  imports: [HandleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StatefulNodeComponent extends CustomNodeComponent {
  width = signal(240);
  height = signal(80);
  draft = '';
}

@Component({
  template: `<div style="width: 100px; height: 50px">
    Drag me<handle type="source" position="right" /><node-toolbar>Tools</node-toolbar>
  </div>`,
  imports: [HandleComponent, NodeToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DragNodeComponent extends CustomNodeComponent {}

/** Core renders nothing for html-template nodes without a consumer template; component nodes measure themselves. */
@Component({
  template: `<div style="width: 100px; height: 50px">
    <handle type="target" position="left" /><handle type="source" position="right" />
  </div>`,
  imports: [HandleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainNodeComponent extends CustomNodeComponent {}

@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" [optimization]="{ virtualization: true }"
    ><mini-map [position]="position()"
  /></vflow>`,
  imports: [VflowComponent, MiniMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MinimapHostComponent {
  position = signal<'bottom-right' | 'top-left'>('bottom-right');
  nodes = [
    createNode({ id: 'node', type: PlainNodeComponent, point: { x: 0, y: 0 } }),
    createNode({ id: 'group', type: 'template-group', point: { x: 1000, y: 0 }, width: 200, height: 100 }),
  ];
}

describe('CSS viewport virtualization', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }));

  async function settle(fixture: ComponentFixture<unknown>) {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  function setup(nodes: Node[]) {
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentRef.setInput('nodes', nodes);
    return fixture;
  }

  it('pans and zooms without reconciling the unchanged graph lists', async () => {
    const trackNodes = spyOn<any>(VflowComponent.prototype, 'trackNodes').and.callThrough();
    const trackEdges = spyOn<any>(VflowComponent.prototype, 'trackEdges').and.callThrough();
    const fixture = setup(
      [0, 1000].map((x, i) => createNode({ id: String(i), type: PlainNodeComponent, point: { x, y: 0 } })),
    );
    fixture.componentRef.setInput('edges', [createEdge({ id: 'edge', source: '0', target: '1' })]);
    await settle(fixture);
    expect(trackNodes).toHaveBeenCalled();
    expect(trackEdges).toHaveBeenCalled();
    // Re-measuring an uncovered node refreshes the view; the graph lists must keep their DOM.
    const before = Array.from(fixture.nativeElement.querySelectorAll('.vflow-node, svg[edge]'));
    fixture.componentInstance.panTo({ x: -1000, y: 0 });
    await fixture.whenStable();
    fixture.componentInstance.zoomTo(0.8);
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.vflow-node, svg[edge]'))).toEqual(before);
    const viewport = fixture.nativeElement.querySelector('.vflow-viewport') as HTMLElement;
    expect(viewport.style.transform).toContain('scale(0.8)');
    const hosts = fixture.nativeElement.querySelectorAll('.vflow-node') as NodeListOf<HTMLElement>;
    expect(getComputedStyle(hosts[0]).display).toBe('none');
    expect(getComputedStyle(hosts[1]).display).not.toBe('none');
  });

  it('drags one node without reconciling unrelated graph lists and keeps drag events and the edge live', async () => {
    const trackNodes = spyOn<any>(VflowComponent.prototype, 'trackNodes').and.callThrough();
    const trackEdges = spyOn<any>(VflowComponent.prototype, 'trackEdges').and.callThrough();
    const fixture = setup(
      [0, 200, 1000].map((x, i) =>
        createNode({ id: String(i), type: i === 0 ? DragNodeComponent : PlainNodeComponent, point: { x, y: 50 } }),
      ),
    );
    fixture.componentRef.setInput('edges', [
      createEdge({
        id: 'edge',
        source: '0',
        target: '1',
        edgeLabels: { center: { type: 'html-template', data: 'Label' } },
      }),
    ]);
    fixture.componentRef.setInput('autoPan', false);
    fixture.componentRef.setInput('nodeDragThreshold', 0);
    await settle(fixture);
    const host = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
    const edgeModel = fixture.debugElement.injector.get(FlowEntitiesService).edges()[0];
    const edge = { getAttribute: (name: string) => (name === 'd' ? edgeModel.path().path : null) };
    const oldPath = edge.getAttribute('d');
    const label = fixture.nativeElement.querySelector('[edgeLabel]') as HTMLElement;
    const oldLabelTransform = label.style.transform;
    const toolbar = fixture.nativeElement.querySelector('.vflow-toolbar') as HTMLElement;
    const oldToolbarX = toolbar.getBoundingClientRect().x;
    const hiddenNode = fixture.debugElement.injector.get(FlowEntitiesService).nodes()[2];
    const connectionUpdates = spyOn(hiddenNode.connectionActive, 'set').and.callThrough();
    const states: string[] = [];
    const subscription = fixture.debugElement.injector
      .get(FlowStatusService)
      .status$.subscribe((status) => states.push(status.state));
    const mouse = (type: string, x: number) =>
      new MouseEvent(type, { clientX: x, clientY: 70, buttons: 1, bubbles: true, view: window });
    host.dispatchEvent(mouse('mousedown', 20));
    await fixture.whenStable();
    trackNodes.calls.reset();
    trackEdges.calls.reset();
    connectionUpdates.calls.reset();
    for (const x of [40, 60, 80]) {
      window.dispatchEvent(mouse('mousemove', x));
      await fixture.whenStable();
    }
    expect(trackNodes).not.toHaveBeenCalled();
    expect(trackEdges).not.toHaveBeenCalled();
    expect(connectionUpdates).not.toHaveBeenCalled();
    expect(host.style.transform).toBe('translate(60px, 50px)');
    expect(edge.getAttribute('d')).not.toBe(oldPath);
    expect(label.style.transform).not.toBe(oldLabelTransform);
    expect(toolbar.getBoundingClientRect().x - oldToolbarX).toBeCloseTo(60);
    window.dispatchEvent(mouse('mouseup', 80));
    await fixture.whenStable();
    expect(states.filter((state) => state === 'node-drag').length).toBe(3);
    expect(states).toContain('node-drag-start');
    expect(states).toContain('node-drag-end');
    fixture.debugElement.injector
      .get(FlowEntitiesService)
      .edges()[0]
      .curve.set(() => ({ path: 'M 0,0 L 100,0' }));
    await fixture.whenStable();
    expect(label.querySelector('.edge-label-wrapper')).toBeNull();
    subscription.unsubscribe();
  });

  it('updates selection semantics and elevation without reconciling graph lists', async () => {
    const trackNodes = spyOn<any>(VflowComponent.prototype, 'trackNodes').and.callThrough();
    const trackEdges = spyOn<any>(VflowComponent.prototype, 'trackEdges').and.callThrough();
    const fixture = setup(
      [0, 200].map((x, i) => createNode({ id: String(i), type: PlainNodeComponent, point: { x, y: 0 } })),
    );
    fixture.componentRef.setInput('edges', [
      createEdge({
        id: 'edge',
        source: '0',
        target: '1',
        edgeLabels: { center: { type: 'html-template', data: 'Label' } },
      }),
    ]);
    await settle(fixture);
    const injector = fixture.debugElement.injector;
    const node = injector.get(FlowEntitiesService).nodes()[0];
    const edge = injector.get(FlowEntitiesService).edges()[0];
    trackNodes.calls.reset();
    trackEdges.calls.reset();
    injector.get(SelectionService).select(node);
    injector.get(NodeRenderingService).pullNode(node);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
    expect(host.getAttribute('aria-label')).toBe(node.accessibility().label);
    expect(host.style.zIndex).toBe(String(node.renderOrder()));
    injector.get(SelectionService).select(edge);
    injector.get(EdgeRenderingService).pull(edge);
    await fixture.whenStable();
    const edgeHost = fixture.nativeElement.querySelector('svg[edge]') as SVGElement;
    expect(edgeHost.getAttribute('aria-label')).toBe(edge.accessibility().label);
    expect(edgeHost.style.zIndex).toBe(String(edge.renderOrder()));
    expect(fixture.nativeElement.querySelector('[edgeLabel]').style.zIndex).toBe(String(edge.renderOrder()));
    expect(trackNodes).not.toHaveBeenCalled();
    expect(trackEdges).not.toHaveBeenCalled();
  });

  it('switches connection targets locally and clears validation and reconnection state', async () => {
    const fixture = setup(
      [0, 200, 1000, 1200].map((x, i) => createNode({ id: String(i), type: PlainNodeComponent, point: { x, y: 0 } })),
    );
    fixture.componentRef.setInput('edges', [createEdge({ id: 'edge', source: '0', target: '2' })]);
    await settle(fixture);
    const injector = fixture.debugElement.injector;
    const [source, first, second, unrelated] = injector.get(FlowEntitiesService).nodes();
    const edge = injector.get(FlowEntitiesService).edges()[0];
    const status = injector.get(FlowStatusService);
    const sourceHandle = source.handles().find((handle) => handle.rawHandle.type === 'source')!;
    const firstHandle = first.handles().find((handle) => handle.rawHandle.type === 'target')!;
    const secondHandle = second.handles().find((handle) => handle.rawHandle.type === 'target')!;
    const unrelatedUpdates = spyOn(unrelated.connectionActive, 'set').and.callThrough();
    status.setConnectionStartStatus(source, sourceHandle);
    await fixture.whenStable();
    const rendered = Array.from(fixture.nativeElement.querySelectorAll('.vflow-node, svg[edge]'));
    unrelatedUpdates.calls.reset();
    status.setConnectionValidationStatus(true, source, first, sourceHandle, firstHandle);
    await fixture.whenStable();
    expect(firstHandle.state()).toBe('valid');
    status.setConnectionValidationStatus(false, source, second, sourceHandle, secondHandle);
    await fixture.whenStable();
    expect(firstHandle.state()).toBe('idle');
    expect(secondHandle.state()).toBe('invalid');
    expect(first.connectionActive()).toBeFalse();
    expect(second.connectionActive()).toBeTrue();
    expect(unrelatedUpdates).not.toHaveBeenCalled();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.vflow-node, svg[edge]'))).toEqual(rendered);
    status.setReconnectionStartStatus(first, firstHandle, edge);
    await fixture.whenStable();
    expect(source.connectionActive()).toBeTrue();
    expect(second.connectionActive()).toBeTrue();
    expect(secondHandle.state()).toBe('idle');
    const edgeHost = fixture.nativeElement.querySelector('svg[edge]') as SVGElement;
    expect(getComputedStyle(edgeHost).visibility).toBe('hidden');
    status.setIdleStatus();
    // Template handles are measured on the next animation frame, unlike the removed standard handles.
    await settle(fixture);
    expect([source, first, second].every((node) => !node.connectionActive())).toBeTrue();
    expect(getComputedStyle(edgeHost).visibility).toBe('visible');
  });

  it('draws the mini-map on canvas, reuses previews during pan/zoom, and refreshes node changes', async () => {
    const trackNodes = spyOn<any>(VflowComponent.prototype, 'trackNodes').and.callThrough();
    const drawPreview = spyOn(CanvasRenderingContext2D.prototype, 'roundRect').and.callThrough();
    const fixture = TestBed.createComponent(MinimapHostComponent);
    await settle(fixture);
    const flow = fixture.debugElement.query(By.directive(VflowComponent));
    const component = flow.componentInstance as VflowComponent;
    const [node, group] = flow.injector.get(FlowEntitiesService).nodes();
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    if (!canvas) return;
    expect(canvas.width).toBe(Math.round(80 * window.devicePixelRatio));
    expect(canvas.height).toBe(Math.round(60 * window.devicePixelRatio));
    expect(canvas.style.left).toBe('310px');
    expect(canvas.style.top).toBe('230px');
    expect(drawPreview).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.node-preview')).toBeNull();
    const initialImage = canvas.toDataURL();
    trackNodes.calls.reset();
    drawPreview.calls.reset();
    component.panTo({ x: -200, y: 0 });
    component.zoomTo(0.8);
    await fixture.whenStable();
    expect(canvas.toDataURL()).not.toBe(initialImage);
    expect(drawPreview).not.toHaveBeenCalled();
    const pannedImage = canvas.toDataURL();
    node.point.set({ x: 50, y: 20 });
    node.selected.set(true);
    group.point.set({ x: 2000, y: 100 });
    group.width.set(300);
    group.selected.set(true);
    await fixture.whenStable();
    expect(drawPreview).toHaveBeenCalledWith(50, 20, node.width(), node.height(), 2);
    expect(drawPreview).toHaveBeenCalledWith(2000, 100, 300, group.height(), 5);
    expect(canvas.toDataURL()).not.toBe(pannedImage);
    expect(trackNodes).not.toHaveBeenCalled();
    fixture.componentInstance.position.set('top-left');
    await fixture.whenStable();
    expect(canvas.style.left).toBe('10px');
    expect(canvas.style.top).toBe('10px');
    fixture.componentInstance.nodes = [];
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(canvas.toDataURL()).not.toBe(pannedImage);
  });

  it('measures initially offscreen custom nodes and renders their crossing edge at every zoom', async () => {
    const fixture = setup(
      [-400, 800].map((x, i) => createNode({ id: String(i), type: StatefulNodeComponent, point: { x, y: 0 } })),
    );
    fixture.componentRef.setInput('optimization', {
      virtualization: true,
      lazyLoadTrigger: 'viewport',
    });
    fixture.componentRef.setInput('edges', [createEdge({ id: 'edge', source: '0', target: '1' })]);
    await settle(fixture);
    const entities = fixture.debugElement.injector.get(FlowEntitiesService);
    expect(entities.nodes().map((node) => [node.width(), node.height(), node.isReady()])).toEqual([
      [240, 80, true],
      [240, 80, true],
    ]);
    const hosts = fixture.nativeElement.querySelectorAll('.vflow-node') as NodeListOf<HTMLElement>;
    hosts.forEach((host) => expect(getComputedStyle(host).display).toBe('none'));
    const edge = fixture.nativeElement.querySelector('svg[edge]') as SVGElement;
    expect(getComputedStyle(edge).display).not.toBe('none');
    expect(getComputedStyle(edge).visibility).toBe('visible');
    fixture.componentInstance.zoomTo(0.1);
    await settle(fixture);
    expect(getComputedStyle(edge).display).not.toBe('none');
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
  });

  it('retains the component, draft and geometry while hidden, then remeasures before showing', async () => {
    const fixture = setup([createNode({ id: 'a', type: StatefulNodeComponent, point: { x: 0, y: 0 } })]);
    await settle(fixture);
    const node = fixture.debugElement.injector.get(FlowEntitiesService).nodes()[0];
    const component = fixture.debugElement.query(By.directive(StatefulNodeComponent))
      .componentInstance as StatefulNodeComponent;
    const host = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
    const input = host.querySelector('input')!;
    input.value = 'unsaved draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const handle = node.handles()[0];
    const oldPoint = handle.pointAbsolute();
    fixture.componentInstance.panTo({ x: 1000, y: 0 });
    await settle(fixture);
    expect(getComputedStyle(host).display).toBe('none');
    expect([node.width(), node.height()]).toEqual([240, 80]);
    expect(handle.pointAbsolute()).toEqual(oldPoint);
    component.width.set(320);
    component.height.set(120);
    await settle(fixture);
    expect([node.width(), node.height()]).toEqual([240, 80]);
    fixture.componentInstance.panTo({ x: 0, y: 0 });
    fixture.detectChanges();
    for (let i = 0; i < 6; i++) {
      await new Promise(requestAnimationFrame);
      if (getComputedStyle(host).visibility === 'visible') {
        expect([node.width(), node.height()]).toEqual([320, 120]);
        expect(host.querySelector<HTMLElement>('.handle--right')!.style.top).toBe('60px');
      }
    }
    expect(fixture.debugElement.query(By.directive(StatefulNodeComponent)).componentInstance).toBe(component);
    expect(host.querySelector('input')).toBe(input);
    expect(component.draft).toBe('unsaved draft');
    expect(input.value).toBe('unsaved draft');
    expect(node.isReady()).toBeTrue();
    // Turning virtualization off restores hidden views without recreating them.
    fixture.componentInstance.panTo({ x: 1000, y: 0 });
    await settle(fixture);
    fixture.componentRef.setInput('optimization', { virtualization: false });
    await settle(fixture);
    expect(getComputedStyle(host).display).not.toBe('none');
    expect(fixture.debugElement.query(By.directive(StatefulNodeComponent)).componentInstance).toBe(component);
  });

  it('preserves focus outside the viewport but does not pin merely selected nodes', async () => {
    const fixture = setup([
      createNode({ id: 'a', type: StatefulNodeComponent, point: { x: 0, y: 0 }, selected: true }),
    ]);
    await settle(fixture);
    const host = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
    const input = host.querySelector('input')!;
    input.focus();
    fixture.componentInstance.panTo({ x: 1000, y: 0 });
    await settle(fixture);
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(host).display).not.toBe('none');
    input.blur();
    await settle(fixture);
    expect(getComputedStyle(host).display).toBe('none');
  });

  it('keeps all nodes in a group drag in layout until the real drag ends', async () => {
    const fixture = setup(
      [0, 150].map((x, i) =>
        createNode({ id: String(i), type: PlainNodeComponent, point: { x, y: 0 }, selected: true }),
      ),
    );
    fixture.componentRef.setInput('nodeDragThreshold', 0);
    fixture.componentRef.setInput('autoPan', false);
    await settle(fixture);
    const hosts = fixture.nativeElement.querySelectorAll('.vflow-node') as NodeListOf<HTMLElement>;
    const mouse = (type: string, x: number) =>
      new MouseEvent(type, { clientX: x, clientY: 20, buttons: 1, bubbles: true, view: window });
    hosts[0].dispatchEvent(mouse('mousedown', 20));
    window.dispatchEvent(mouse('mousemove', -1000));
    await settle(fixture);
    const nodes = fixture.debugElement.injector.get(FlowEntitiesService).nodes();
    expect(nodes.every((node) => node.dragging())).toBeTrue();
    hosts.forEach((host) => expect(getComputedStyle(host).display).not.toBe('none'));
    window.dispatchEvent(mouse('mouseup', -1000));
    await settle(fixture);
    expect(nodes.every((node) => !node.dragging())).toBeTrue();
    hosts.forEach((host) => expect(getComputedStyle(host).display).toBe('none'));
  });

  it('skips CSS-hidden entities when repairing focus after node removal', async () => {
    const nodes = [0, 1000, 200].map((x, i) =>
      createNode({ id: String(i), type: PlainNodeComponent, point: { x, y: 0 } }),
    );
    const fixture = setup(nodes);
    await settle(fixture);
    const hosts = fixture.nativeElement.querySelectorAll('.vflow-node') as NodeListOf<HTMLElement>;
    hosts[0].focus();
    fixture.componentRef.setInput('nodes', nodes.slice(1));
    await settle(fixture);
    expect(document.activeElement).toBe(hosts[2]);
  });

  it('keeps resize and connection participants in layout and releases them afterwards', async () => {
    const fixture = setup([createNode({ id: 'a', type: PlainNodeComponent, point: { x: 0, y: 0 } })]);
    await settle(fixture);
    const node = fixture.debugElement.injector.get(FlowEntitiesService).nodes()[0];
    const host = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
    node.resizing.set(true);
    fixture.componentInstance.panTo({ x: 1000, y: 0 });
    await settle(fixture);
    expect(getComputedStyle(host).display).not.toBe('none');
    const status = fixture.debugElement.injector.get(FlowStatusService);
    status.setConnectionStartStatus(node, node.handles()[0]);
    node.resizing.set(false);
    await settle(fixture);
    expect(getComputedStyle(host).display).not.toBe('none');
    status.setIdleStatus();
    await settle(fixture);
    expect(getComputedStyle(host).display).toBe('none');
  });
});
