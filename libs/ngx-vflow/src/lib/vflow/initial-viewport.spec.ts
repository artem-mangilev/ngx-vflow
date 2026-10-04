import {
  ChangeDetectionStrategy,
  Component,
  effect,
  provideZonelessChangeDetection,
  untracked,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { VflowHandleDirective } from './directives/handle.directive';

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
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" [edges]="edges" [background]="{ type: 'dots' }" />`,
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

  constructor() {
    effect(() => {
      if (this.flow().initialized()) untracked(() => this.flow().fitView());
    });
  }
}

const frames = async (count: number) => {
  for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
};

describe('Initial viewport', () => {
  it('paints the graph for the first time with the viewport set in reaction to initialized', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(FitOnInitComponent);
    const root = fixture.nativeElement as HTMLElement;
    const states: string[] = [];
    const violations: string[] = [];

    // Mutation callbacks run after every task, so they see every state the browser could paint.
    const check = () => {
      const flow = fixture.componentInstance.flow();
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('.v-node'));
      const shown = [...nodes, ...Array.from(root.querySelectorAll('svg[edge], .v-background-svg'))].filter(
        (element) => getComputedStyle(element).visibility === 'visible',
      );
      const transform = root.querySelector<HTMLElement>('.v-viewport')!.style.transform;
      const state = `initialized=${flow.initialized()} shown=${shown.length} transform=${transform}`;
      if (states.at(-1) !== state) states.push(state);

      if (shown.length && transform === IDENTITY) violations.push(`painted before fitView: ${state}`);
      if (flow.initialized() && nodes.some((node) => node.style.visibility === 'hidden')) {
        violations.push(`initialized before every node is laid out: ${state}`);
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    fixture.detectChanges();
    check();
    expect(fixture.componentInstance.flow().initialized()).toBeFalse();

    await frames(8);
    observer.disconnect();
    check();

    expect(violations).withContext(states.join('\n')).toEqual([]);
    expect(fixture.componentInstance.flow().initialized()).toBeTrue();
    expect(states.at(-1)).not.toContain(IDENTITY);
    expect(states.at(-1)).toContain('shown=4');
  });

  it('does not keep the graph hidden for a node without a layout box', async () => {
    const style = document.createElement('style');
    style.textContent = '.v-node:has(.no-box) { display: none; }';
    document.head.append(style);

    try {
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      const fixture = TestBed.createComponent(VflowComponent);
      fixture.componentRef.setInput('view', [400, 300]);
      fixture.componentRef.setInput('nodes', [
        createNode({ id: 'shown', component: HandleNodeComponent, point: { x: 0, y: 0 } }),
        createNode({ id: 'collapsed', component: NoBoxNodeComponent, point: { x: 200, y: 0 } }),
      ]);
      fixture.detectChanges();
      await frames(8);

      expect(fixture.componentInstance.initialized()).toBeTrue();
      const shown = fixture.nativeElement.querySelector('.v-node:not(:has(.no-box))');
      expect(getComputedStyle(shown).visibility).toBe('visible');
    } finally {
      style.remove();
    }
  });

  it('fits within the zoom bounds a call gives, inside the flow limits', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(FitOnInitComponent);
    fixture.detectChanges();
    await frames(8);
    const flow = fixture.componentInstance.flow();
    const unbounded = flow.viewport().zoom;
    expect(unbounded).toBeGreaterThan(0.5);
    expect(unbounded).toBeLessThan(1);

    // A single node would fill the pane at the flow's maxZoom.
    expect(await flow.fitView({ nodes: ['a'], maxZoom: 1.5 })).toBeTrue();
    expect(flow.viewport().zoom).toBe(1.5);
    expect(await flow.fitView({ minZoom: 1 })).toBeTrue();
    expect(flow.viewport().zoom).toBe(1);
    // maxZoom wins over a greater minZoom; both stay within the flow limits.
    await flow.fitView({ minZoom: 2, maxZoom: 1.5 });
    expect(flow.viewport().zoom).toBe(1.5);
    await flow.fitView({ minZoom: 0.01 });
    expect(flow.viewport().zoom).toBe(unbounded);
    await flow.fitView({ nodes: ['a'], maxZoom: 10 });
    expect(flow.viewport().zoom).toBe(3);

    expect(() => flow.fitView({ maxZoom: 0 })).toThrowError(RangeError);
    expect(await flow.fitView({ nodes: ['missing'] })).toBeFalse();
  });
});
