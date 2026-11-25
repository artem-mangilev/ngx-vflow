import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { EdgeModel } from './edge.model';
import { createNodes } from '../interfaces/node.interface';
import { Curve, Edge, createEdge, createEdges } from '../interfaces/edge.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { Vflow } from '../vflow';
import { VflowComponent } from '../components/vflow/vflow.component';
import { HandleType } from '../types/handle-type.type';
import { CurveFactoryParams } from '../interfaces/curve-factory.interface';

describe('EdgeModel', () => {
  let settingsService: FlowSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });

    settingsService = TestBed.inject(FlowSettingsService);
  });

  const make = (edge: Parameters<typeof createEdge>[0]) =>
    TestBed.runInInjectionContext(() => new EdgeModel(createEdge(edge)));

  it.each([
    ['selectable', 'edgesSelectable'],
    ['focusable', 'edgesFocusable'],
  ] as const)('follows the %s default of the flow', (capability, setting) => {
    const model = make({ id: 'e', source: '1', target: '2' });
    expect(model[capability]()).toBe(true);

    settingsService.bind({ [setting]: signal(false) });

    expect(model[capability]()).toBe(false);
  });

  it.each([
    ['selectable', 'edgesSelectable', false],
    ['focusable', 'edgesFocusable', true],
  ] as const)('lets the %s value of an edge win over the flow default', (capability, setting, value) => {
    const model = make({ id: 'explicit', source: '1', target: '2', [capability]: value });

    settingsService.bind({ [setting]: signal(!value) });

    expect(model[capability]()).toBe(value);
  });

  describe('signals added to the edge object later', () => {
    const makeLate = () => {
      const edge: Edge = { id: 'late', source: '1', target: '2' };
      const entities = TestBed.inject(FlowEntitiesService);
      const late = TestBed.runInInjectionContext(() => new EdgeModel(edge));
      entities.edges.update((edges) => [...edges, late]);
      return { edge, late, passNewArray: () => entities.edges.update((edges) => [...edges]) };
    };

    it('reads them once the application passes a new array', () => {
      const { edge, late, passNewArray } = makeLate();
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

    it('adds no signal to the application object on selection', () => {
      const { edge, late } = makeLate();

      late.selected.set(true);

      expect(Object.keys(edge)).toEqual(['id', 'source', 'target']);
    });

    it('takes the selection from an application signal over the selection held by the model', () => {
      const { edge, late, passNewArray } = makeLate();
      late.selected.set(true);

      edge.selected = signal(false);
      passNewArray();

      expect(late.selected()).toBe(false);
      expect(late.context.$implicit.selected()).toBe(false);
    });

    it('selects into an application signal it has read', () => {
      const { edge, late, passNewArray } = makeLate();
      edge.selected = signal(false);
      passNewArray();

      late.selected.set(true);

      expect(edge.selected()).toBe(true);
    });
  });
});

/** Two nodes of 100 × 50, `a` with a source handle on the right, `b` with a target handle on the left. */
@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 600px; height: 300px" [nodes]="nodes" [edges]="edges()" [virtualization]="true">
    <div *vNode="let ctx" style="width: 100px; height: 50px">
      @if (ctx.node.id === 'a') {
        @if (sourceType(); as type) {
          <span vHandle [handleType]="type" [position]="auto() ? 'auto' : 'right'"></span>
        }
      } @else {
        @if (targetType(); as type) {
          <span vHandle [handleType]="type" [position]="auto() ? 'auto' : 'left'"></span>
        }
      }
    </div>
    <svg:path
      *vEdge="let ctx"
      data-testid="edge"
      fill="none"
      [attr.d]="ctx.path()"
      [attr.marker-start]="ctx.markerStart()"
      [attr.marker-end]="ctx.markerEnd()" />
    <ng-template vMarker="diamond" inset="10">
      <svg:polygon fill="context-stroke" points="0,0 -5,-4 -10,0 -5,4" />
    </ng-template>
  </vflow>`,
})
class EdgeHostComponent {
  public readonly flow = viewChild.required(VflowComponent);
  public readonly sourceType = signal<HandleType | null>('source');
  public readonly targetType = signal<HandleType | null>('target');
  public readonly auto = signal(false);
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
  ]);
  public readonly edges = signal<Edge[]>(createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: 'straight' }]));
}

describe('EdgeModel in a flow', () => {
  async function setup(configure: (host: EdgeHostComponent) => void = () => undefined) {
    const fixture = TestBed.createComponent(EdgeHostComponent);
    const host = fixture.componentInstance;
    configure(host);
    const root = fixture.nativeElement as HTMLElement;
    const stable = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const path = () => root.querySelector('[data-testid="edge"]')?.getAttribute('d') ?? null;
    const detached = () =>
      host
        .flow()
        .detachedEdges()
        .map((edge) => edge.id);
    await stable();
    return { fixture, host, root, stable, path, detached };
  }

  /** Half the rendered width of a handle: the connection point is its outer edge. */
  const halfHandle = (root: HTMLElement) =>
    root.querySelector('[data-v-handle-type]')!.getBoundingClientRect().width / 2;

  it('draws the path between the handle points of its nodes', async () => {
    const { root, path } = await setup();

    await expect.poll(path).toBe(`M ${100 + halfHandle(root)},25L ${300 - halfHandle(root)},25`);
  });

  it('follows a node that moves', async () => {
    const { host, root, path, stable } = await setup();
    await expect.poll(path).not.toBeNull();

    host.nodes[1].point.set({ x: 300, y: 100 });
    await stable();

    await expect.poll(path).toBe(`M ${100 + halfHandle(root)},25L ${300 - halfHandle(root)},125`);
  });

  it.each<[string, (host: EdgeHostComponent) => void]>([
    ['its source node is missing', (host) => host.edges.set(createEdges([{ id: 'a-b', source: 'x', target: 'b' }]))],
    ['its target node is missing', (host) => host.edges.set(createEdges([{ id: 'a-b', source: 'a', target: 'x' }]))],
    ['its source node renders no source handle', (host) => host.sourceType.set(null)],
    ['its target node renders no target handle', (host) => host.targetType.set(null)],
    ['its target node renders only a source handle', (host) => host.targetType.set('source')],
  ])('is detached when %s', async (_, change) => {
    const { host, stable, detached } = await setup();
    await expect.poll(detached).toEqual([]);

    change(host);
    await stable();

    await expect.poll(detached).toEqual(['a-b']);
  });

  it('connects to a handle of type any in the target role', async () => {
    const { host, stable, detached } = await setup((host) => host.targetType.set('source'));
    await expect.poll(detached).toEqual(['a-b']);

    host.targetType.set('any');
    await stable();

    await expect.poll(detached).toEqual([]);
  });

  describe('custom curve', () => {
    async function setupCurve() {
      const calls: CurveFactoryParams[] = [];
      const flow = await setup((host) =>
        host.edges()[0].curve!.set((params) => {
          calls.push(params);
          return { path: 'M 0,0' };
        }),
      );
      await expect.poll(() => calls.at(-1)?.targetPoint.x).toBe(300 - halfHandle(flow.root));
      return { ...flow, last: () => calls.at(-1)! };
    }

    it('insets the end of a closed arrow to the base of its head', async () => {
      const { host, root, stable, last } = await setupCurve();

      host.edges()[0].markers!.set({ end: { type: 'arrow-closed', width: 20 } });
      await stable();

      // A closed arrow of 20 flow units: the path ends 7 units before the tip, away from the node.
      expect(last().markerInset).toEqual({ start: 0, end: 7 });
      expect(last().targetPoint.x).toBe(300 - halfHandle(root) - 7);
    });

    it('runs the path of an open arrow through its head to just short of the tip', async () => {
      const { host, stable, last } = await setupCurve();

      host.edges()[0].markers!.set({ end: { type: 'arrow', width: 20 } });
      await stable();

      expect(last().markerInset).toEqual({ start: 0, end: 2 });
    });

    it('insets a declared marker shape by the inset it declares', async () => {
      const { host, stable, last } = await setupCurve();

      host.edges()[0].markers!.set({ start: { type: 'diamond', width: 20 } });
      await stable();

      expect(last().markerInset).toEqual({ start: 10, end: 0 });
    });
  });

  it('shares one marker between the type alone, an empty marker and the default type', async () => {
    const { host, root, stable } = await setup();
    host.edges()[0].markers!.set({ start: 'arrow-closed', end: {} });
    await stable();

    const edge = root.querySelector('[data-testid="edge"]')!;
    expect(edge.getAttribute('marker-start')).toMatch(/^url\(#-?\d+\)$/);
    expect(edge.getAttribute('marker-start')).toBe(edge.getAttribute('marker-end'));
  });

  describe.each([
    ['source', 0],
    ['target', 1],
  ])('between auto handles, with the %s node out of the viewport', (_, index) => {
    it('keeps the edge attached and follows the node', async () => {
      const { host, path, detached, stable } = await setup((host) => host.auto.set(true));
      await expect.poll(path).toMatch(/^M /);
      const before = path();

      host.nodes[index].point.set({ x: -1000, y: 0 });
      await stable();

      await expect.poll(path).not.toBe(before);
      expect(path()).toMatch(/^M /);
      expect(detached()).toEqual([]);
    });

    it('detaches the edge once the node stops rendering its handle', async () => {
      const { host, path, detached, stable } = await setup((host) => host.auto.set(true));
      await expect.poll(path).toMatch(/^M /);
      host.nodes[index].point.set({ x: -1000, y: 0 });
      await stable();

      (index === 0 ? host.sourceType : host.targetType).set(null);
      await stable();

      await expect.poll(detached).toEqual(['a-b']);
      expect(path() ?? '').toBe('');
    });
  });
});
