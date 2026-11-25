import { ChangeDetectionStrategy, Component, effect, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { VflowHandleDirective } from './public-directives/handle.directive';

const IDENTITY = 'translate(0px, 0px) scale(1)';

@Component({
  template: `<div style="width:100px;height:48px">
    Custom node
    <span vHandle handleType="target" position="left"></span>
    <span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HandleNodeComponent {}

@Component({
  template: `<div class="no-box">Collapsed</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NoBoxNodeComponent {}

@Component({
  template: `<vflow
    #flow
    style="width: 400px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    [background]="{ type: 'dots' }"
    (initialized)="initialized = initialized + 1; flow.fitView()" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FitOnInitComponent {
  public readonly flow = viewChild.required(VflowComponent);

  public readonly nodes = [
    createNode({ id: 'a', component: HandleNodeComponent, point: { x: 0, y: 0 } }),
    createNode({ id: 'b', component: HandleNodeComponent, point: { x: 600, y: 400 } }),
  ];

  public readonly edges = [createEdge({ id: 'ab', source: 'a', target: 'b' })];

  /** How many times the flow emitted `initialized`. */
  public initialized = 0;
}

async function renderFitOnInit() {
  const fixture = TestBed.createComponent(FitOnInitComponent);
  fixture.detectChanges();
  await expect.poll(() => fixture.componentInstance.initialized).toBe(1);
  await fixture.whenStable();
  return fixture;
}

describe('Initial viewport', () => {
  it('paints the graph for the first time with the viewport set in reaction to initialized', async () => {
    const fixture = TestBed.createComponent(FitOnInitComponent);
    const root = fixture.nativeElement as HTMLElement;
    const states: string[] = [];
    const violations: string[] = [];

    // Mutation callbacks run after every task, so they see every state the browser could paint.
    const check = () => {
      const initialized = fixture.componentInstance.initialized > 0;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-v-node]'));
      const shown = [...nodes, ...Array.from(root.querySelectorAll('svg[edge], .v-background-svg'))].filter(
        (element) => getComputedStyle(element).visibility === 'visible',
      );
      const transform = root.querySelector<HTMLElement>('.v-viewport')!.style.transform;
      const state = `initialized=${initialized} shown=${shown.length} transform=${transform}`;
      if (states.at(-1) !== state) states.push(state);

      if (shown.length && transform === IDENTITY) violations.push(`painted before fitView: ${state}`);
      if (initialized && nodes.some((node) => getComputedStyle(node).visibility === 'hidden')) {
        violations.push(`initialized before every node is laid out: ${state}`);
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'data-v-pending'],
    });

    fixture.detectChanges();
    check();
    await expect.poll(() => fixture.componentInstance.initialized).toBe(1);
    await fixture.whenStable();
    // Pending mutation callbacks are microtasks queued before this one.
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    observer.disconnect();
    check();

    expect(violations, states.join('\n')).toEqual([]);
    expect(states.at(-1)).not.toContain(IDENTITY);
    expect(states.at(-1)).toContain('shown=4');
  });

  it('does not keep the graph hidden for a node without a layout box', async () => {
    const style = document.createElement('style');
    style.textContent = '[data-v-node]:has(.no-box) { display: none; }';
    document.head.append(style);
    onTestFinished(() => style.remove());

    const fixture = TestBed.createComponent(VflowComponent);
    let initialized = false;
    fixture.componentInstance.initialized.subscribe(() => (initialized = true));
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'shown', component: HandleNodeComponent, point: { x: 0, y: 0 } }),
      createNode({ id: 'collapsed', component: NoBoxNodeComponent, point: { x: 200, y: 0 } }),
    ]);
    fixture.detectChanges();
    await expect.poll(() => initialized).toBe(true);
    await fixture.whenStable();

    const shown = fixture.nativeElement.querySelector('[data-v-node]:not(:has(.no-box))');
    expect(getComputedStyle(shown).visibility).toBe('visible');
  });

  describe('initialized', () => {
    let fixture: ComponentFixture<VflowComponent>;
    let emissions: number;

    beforeEach(async () => {
      fixture = TestBed.createComponent(VflowComponent);
      emissions = 0;
      fixture.componentInstance.initialized.subscribe(() => emissions++);
      Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
      fixture.componentRef.setInput('nodes', []);
      fixture.detectChanges();
      await expect.poll(() => emissions).toBe(1);
    });

    it('is emitted for an empty graph', () => {
      expect(emissions).toBe(1);
    });

    it('is not emitted again when the graph and the size of the flow change', async () => {
      fixture.componentRef.setInput('nodes', [
        createNode({ id: 'a', component: HandleNodeComponent, point: { x: 0, y: 0 } }),
      ]);
      Object.assign(fixture.nativeElement.style, { width: '500px', height: '300px' });
      fixture.detectChanges();
      // The new node is laid out: the point where a first layout would emit.
      await expect.poll(() => fixture.componentInstance.getNodeRect('a')?.width).toBe(100);
      await fixture.whenStable();

      expect(emissions).toBe(1);
    });
  });

  it('keeps an effect that fits the view independent of the nodes it fits', async () => {
    const fixture = await renderFitOnInit();
    const flow = fixture.componentInstance.flow();
    let runs = 0;
    TestBed.runInInjectionContext(() =>
      effect(() => {
        runs++;
        flow.fitView();
      }),
    );
    TestBed.tick();
    const zoom = flow.viewport().zoom;

    fixture.componentInstance.nodes[1].point.set({ x: 1200, y: 800 });
    fixture.detectChanges();
    await fixture.whenStable();
    TestBed.tick();

    expect(runs).toBe(1);
    expect(flow.viewport().zoom).toBe(zoom);
  });

  describe('fitView zoom bounds', () => {
    let flow: VflowComponent;
    /** The zoom that fits both nodes with no bounds given: about 0.6 for this graph. */
    let unbounded: number;

    beforeEach(async () => {
      flow = (await renderFitOnInit()).componentInstance.flow();
      unbounded = flow.viewport().zoom;
    });

    it('fits the graph inside the zoom limits of the flow without bounds', () => {
      expect(unbounded).toBeGreaterThan(0.5);
      expect(unbounded).toBeLessThan(1);
    });

    it.each([
      // A single node would fill the pane at the flow's maxZoom.
      ['a maxZoom below the zoom that fits', { nodes: ['a'], maxZoom: 1.5 }, 1.5],
      ['a minZoom above the zoom that fits', { minZoom: 1 }, 1],
      ['a maxZoom over a greater minZoom', { minZoom: 2, maxZoom: 1.5 }, 1.5],
      ['the flow maxZoom over a greater maxZoom', { nodes: ['a'], maxZoom: 10 }, 3],
    ])('keeps to %s', async (_, options, zoom) => {
      expect(await flow.fitView(options)).toBe(true);
      expect(flow.viewport().zoom).toBe(zoom);
    });

    it('does not zoom out for a minZoom below the zoom that fits', async () => {
      await flow.fitView({ minZoom: 0.01 });

      expect(flow.viewport().zoom).toBe(unbounded);
    });

    it('throws a RangeError for a maxZoom of 0', () => {
      expect(() => flow.fitView({ maxZoom: 0 })).toThrowError(RangeError);
    });

    it('resolves to false for nodes the flow does not have', async () => {
      expect(await flow.fitView({ nodes: ['missing'] })).toBe(false);
    });
  });
});
