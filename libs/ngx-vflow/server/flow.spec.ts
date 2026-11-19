import '@angular/compiler';
import {
  ChangeDetectionStrategy,
  Component,
  PendingTasks,
  effect,
  inject,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { Curve, CurveFactory, Edge, Node, Vflow, VflowComponent, injectNode } from 'ngx-vflow';

@Component({
  template: `<div vResizable>
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

/** A curve without bounds of its own: the flow measures its path, which no server can do. */
const chord: CurveFactory = ({ sourcePoint, targetPoint }) => ({
  path: `M${sourcePoint.x},${sourcePoint.y} L${targetPoint.x},${targetPoint.y}`,
});

@Component({
  selector: 'app-root',
  template: `<vflow
      [nodes]="nodes()"
      [edges]="edges()"
      #flow
      [background]="{ type: 'dots' }"
      [alignmentHelper]="true"
      (initialized)="initialized()">
      <div *vNode="let ctx" class="note">
        note {{ ctx.node.id }}
        <span vHandle handleType="target" position="left"></span>
      </div>
      <ng-template vEdge let-ctx>
        <svg:g vEdgeInteractionArea><svg:path class="edge-path" [attr.d]="ctx.path()" /></svg:g>
        <ng-template vEdgeLabel>{{ ctx.edge.id }}</ng-template>
      </ng-template>
      <ng-template vConnection let-ctx><svg:path [attr.d]="ctx.path()" /></ng-template>
      <v-minimap />
    </vflow>
    <vflow [nodes]="[]" [background]="{ type: 'image', src: 'tile.png' }" />
    <output>fitted: {{ fitted() }}</output>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly nodes = signal<Node[]>([
    { id: 'task', component: TaskNodeComponent, point: signal({ x: 0, y: 0 }), data: signal({ title: 'Review' }) },
    { id: 'note', point: signal({ x: 250, y: 0 }) },
    { id: 'sized', point: signal({ x: 250, y: 150 }), width: signal(120), height: signal(60) },
  ]);
  readonly edges = signal<Edge[]>([
    { id: 'task-note', source: 'task', target: 'note' },
    { id: 'task-sized', source: 'task', target: 'sized', curve: signal<Curve>(chord) },
  ]);

  private readonly flow = viewChild.required<VflowComponent>('flow');
  /** What `fitView()` resolved to. */
  protected readonly fitted = signal<boolean | null>(null);

  constructor() {
    // An application usually waits for something before its page is serialized, a request for example. The flow
    // goes on reacting meanwhile: effects that an effect of the flow creates run in a later pass.
    inject(PendingTasks).run(() => new Promise((resolve) => setTimeout(resolve, 20)));
    effect(
      () =>
        void this.flow()
          .fitView()
          .then((fitted) => this.fitted.set(fitted)),
    );
  }

  protected initialized(): void {
    throw new Error('A server render has no layout, so a flow is never initialized in it');
  }
}

// A server has no window of a size, no global document and no layout. These specs cover a server render of an
// application and the prerender of a build: the flow is rendered into a string and never measured.
describe('Vflow in a server render', () => {
  /** What the render logged with `console.error` and `console.warn`: Angular reports an error of an effect there. */
  let logged: unknown[][];
  let html: string;

  beforeAll(async () => {
    const consoleError = vi.spyOn(console, 'error');
    const consoleWarn = vi.spyOn(console, 'warn');

    const bootstrap = (context: BootstrapContext) =>
      bootstrapApplication(
        HostComponent,
        { providers: [provideServerRendering(), provideZonelessChangeDetection()] },
        context,
      );

    // Rendering ends with the destruction of the application, so the teardown of the flow is covered too.
    html = await renderApplication(bootstrap, { document: '<html><body><app-root></app-root></body></html>' });
    // Read here: the spies are restored before every test.
    logged = [...consoleError.mock.calls, ...consoleWarn.mock.calls];
  });

  it('renders and is destroyed without an error or a warning', () => {
    expect(logged).toEqual([]);
  });

  it('renders component and template node presentations with their data', () => {
    expect(html.match(/data-v-node="[^"]+"/g)).toEqual([
      'data-v-node="task"',
      'data-v-node="note"',
      'data-v-node="sized"',
    ]);
    expect(html).toContain('Review');
    expect(html).toContain('note sized');
    expect(html.match(/data-v-handle=""/g)?.length).toBe(4);
  });

  it('renders the edge, the minimap and the node toolbar', () => {
    expect(html).toContain('data-v-edge="task-note"');
    expect(html).toContain('data-v-edge="task-sized"');
    expect(html).toContain('<v-minimap');
    expect(html).toContain('<v-node-toolbar');
  });

  it('waits for the first layout, which the browser that receives the page makes', () => {
    const host = html.match(/<vflow[^>]*>/)![0];

    expect(host).toContain('v-initializing');
    // The class of a DOM that never lays out: with it nothing would be hidden, and the reader would see the nodes
    // unmeasured and the viewport unfitted until the application starts.
    expect(host).not.toContain('v-no-layout');
    expect(html.match(/<div[^>]*data-v-node="task"[^>]*>/)![0]).toContain('data-v-pending');
  });

  it('fits nothing, because nothing is measured', () => {
    expect(html).toContain('fitted: false');
  });

  it('asks Angular to create it anew in the browser instead of hydrating it', () => {
    const hosts = html.match(/<vflow[^>]*>/g)!;

    expect(hosts.length).toBe(2);
    expect(hosts.every((host) => host.includes('ngskiphydration="true"'))).toBe(true);
  });
});
