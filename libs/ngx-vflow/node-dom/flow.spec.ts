import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Connection, Edge, Node, NodeSelectedChange, Vflow, VflowComponent, injectNode } from 'ngx-vflow';

@Component({
  template: `<div vSelectable vResizable>
    <span vDragHandle>{{ ctx.data().title }}</span>
    <span vHandle handleType="target" position="left"></span>
    <span vHandle handleType="source" position="right"></span>
    <v-node-toolbar position="top"><button vNoDrag>Delete</button></v-node-toolbar>
  </div>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskNodeComponent {
  protected readonly ctx = injectNode<{ title: string }>();
}

@Component({
  template: `<vflow
    #flow
    [nodes]="nodes()"
    [edges]="edges()"
    (connect)="connects.push($event)"
    (nodesChanges.select)="selectChanges.push($event)">
    <ng-template vNode let-ctx>
      <div class="note" vSelectable [class.selected]="ctx.selected()">
        note {{ ctx.node.id }}
        <span vHandle handleType="target" position="left"></span>
      </div>
    </ng-template>
    <ng-template vEdge let-ctx>
      <svg:g vEdgeInteraction><svg:path class="edge-path" [attr.d]="ctx.path()" /></svg:g>
      <ng-template vEdgeLabel>{{ ctx.edge.id }}</ng-template>
    </ng-template>
    <v-minimap />
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly flow = viewChild.required<VflowComponent>('flow');
  readonly nodes = signal<Node[]>([
    { id: 'task', component: TaskNodeComponent, point: signal({ x: 0, y: 0 }), data: signal({ title: 'Review' }) },
    { id: 'note', point: signal({ x: 250, y: 0 }) },
    { id: 'sized', point: signal({ x: 250, y: 150 }), width: signal(120), height: signal(60) },
  ]);
  readonly edges = signal<Edge[]>([{ id: 'task-note', source: 'task', target: 'note' }]);
  readonly connects: Connection[] = [];
  readonly selectChanges: NodeSelectedChange[][] = [];
}

// jsdom and happy-dom have no layout: these specs cover what an application test can rely on without a browser.
describe('Vflow in a DOM without layout', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let element: HTMLElement;
  let consoleError: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    consoleError = vi.spyOn(console, 'error');
    consoleWarn = vi.spyOn(console, 'warn');
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    element = fixture.nativeElement;
    await settle();
  });

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('renders component and template node presentations with their data', () => {
    const nodes = Array.from(element.querySelectorAll('.v-node'));

    expect(nodes.map((node) => node.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'ReviewDelete',
      'note note',
      'note sized',
    ]);
    expect(element.querySelectorAll('[vHandle]').length).toBe(4);
  });

  it('hides nothing while it waits for a first layout that cannot come', () => {
    const visibility = (selector: string) => getComputedStyle(element.querySelector(selector)!).visibility;

    expect(
      ['.v-node button', '.note', '.edge-path', '.v-edge-labels-layer > *', '.v-viewport', 'v-minimap'].filter(
        (selector) => visibility(selector) === 'hidden',
      ),
    ).toEqual([]);
  });

  it('renders an edge presentation with a path between the node positions and its label', () => {
    expect(element.querySelector('.edge-path')!.getAttribute('d')).toMatch(/^M0,0 .*250,0$/);
    expect(element.querySelector('.v-edge-labels-layer')!.textContent).toContain('task-note');
  });

  it('emits a connection for a pointer press on a source handle released on a target handle', async () => {
    const source = element.querySelector('[vHandle][handleType="source"]')!;
    const target = element.querySelector('.note [vHandle]')!;

    source.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, isPrimary: true }));
    await settle();
    target.dispatchEvent(new PointerEvent('pointerenter'));
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await settle();

    expect(host.connects).toEqual([
      { source: 'task', target: 'note', sourceHandleType: 'source', targetHandleType: 'target' },
    ]);
  });

  it('selects a node on a click on its presentation and reports the change', async () => {
    element.querySelector<HTMLElement>('.note')!.click();
    await settle();

    expect(element.querySelector('.note')!.classList).toContain('selected');
    // Changes are delivered in a later task.
    await vi.waitFor(() => expect(host.selectChanges).toEqual([[{ type: 'select', id: 'note', selected: true }]]));
  });

  it('follows the nodes and edges of the application', async () => {
    host.nodes.update((nodes) => [...nodes.slice(1), { id: 'added', point: signal({ x: 0, y: 300 }) }]);
    host.edges.set([]);
    await settle();

    expect(Array.from(element.querySelectorAll('.note')).map((note) => note.textContent?.trim())).toEqual([
      'note note',
      'note sized',
      'note added',
    ]);
    expect(element.querySelector('.edge-path')).toBeNull();
  });

  it('applies programmatic viewport changes, and reports that the first layout never completes', async () => {
    expect(await host.flow().zoomTo(2)).toBe(true);
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 2 });
    expect(await host.flow().setViewport({ x: 10, y: 20, zoom: 1 })).toBe(true);
    expect(host.flow().viewport()).toEqual({ x: 10, y: 20, zoom: 1 });
    await host.flow().zoomIn();
    expect(host.flow().viewport().zoom).toBeGreaterThan(1);
    await host.flow().zoomOut();
    expect(host.flow().viewport().zoom).toBeCloseTo(1);
    expect(host.flow().getNode('task')?.id).toBe('task');

    expect(host.flow().initialized()).toBe(false);
    expect(await host.flow().fitView()).toBe(false);
  });
});
