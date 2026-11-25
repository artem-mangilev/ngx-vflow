import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { EdgeLabelOrient, EdgeLabelPosition } from '../../interfaces/edge-label.interface';
import { CurveFactory } from '../../interfaces/curve-factory.interface';
import {
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowNodeTemplateDirective,
} from '../../public-directives/template.directive';
import { VflowHandleDirective } from '../../public-directives/handle.directive';
import { injectEdge } from '../../utils/inject-edge';

/** Label points the curves of this spec give every edge, so the expected label positions are known numbers. */
const POINTS = {
  start: { x: 40, y: 30 },
  center: { x: 150, y: 80, angle: 30 },
  end: { x: 260, y: 130 },
};

const path: CurveFactory = ({ sourcePoint, targetPoint }) => ({
  path: `M ${sourcePoint.x},${sourcePoint.y} L ${targetPoint.x},${targetPoint.y}`,
});

const line: CurveFactory = (params) => ({ ...path(params), labelPoints: POINTS });

/** A direction past 90 degrees: a readable label turns back by 180. */
const steep: CurveFactory = (params) => ({
  ...path(params),
  labelPoints: { ...POINTS, center: { ...POINTS.center, angle: 120 } },
});

const withoutAngles: CurveFactory = (params) => ({
  ...path(params),
  labelPoints: { ...POINTS, center: { x: POINTS.center.x, y: POINTS.center.y } },
});

/** Reads the edge through DI from inside label content. */
@Component({
  selector: 'label-edge-id',
  template: `{{ ctx.edge.id }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelEdgeIdComponent {
  readonly ctx = injectEdge();
}

@Component({
  selector: 'g[labelledEdge]',
  imports: [VflowEdgeLabelTemplateDirective],
  template: `
    <svg:path fill="none" [attr.d]="ctx.path()" />
    <span *vEdgeLabel="'end'" class="component-label">{{ ctx.data().label }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelledEdgeComponent {
  readonly ctx = injectEdge<{ label: string }>();
}

@Component({
  template: `<vflow style="width: 600px; height: 400px" [nodes]="nodes" [edges]="edges">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
    <ng-template let-ctx vEdge>
      <svg:g><svg:path fill="none" [attr.d]="ctx.path()" /></svg:g>
      @switch (ctx.edge.id) {
        @case ('template') {
          @if (showCenter()) {
            <span *vEdgeLabel class="center-label">{{ ctx.data().label }}</span>
          }
          <ng-template [vEdgeLabel]="movable()">
            <span class="movable-label"><label-edge-id /></span>
          </ng-template>
        }
        @case ('long-form') {
          <ng-template vEdgeLabel><span class="long-form-label">Long form</span></ng-template>
        }
        @case ('inside-svg') {
          <svg:g><span *vEdgeLabel class="svg-label">Inside SVG</span></svg:g>
        }
        @case ('duplicate') {
          <span *vEdgeLabel class="first-duplicate">First</span>
          <span *vEdgeLabel class="second-duplicate">Second</span>
        }
        @case ('along') {
          <span *vEdgeLabel="'center'; orient: orient()" class="along-label">Along</span>
        }
      }
    </ng-template>
  </vflow>`,
  imports: [
    VflowComponent,
    VflowNodeTemplateDirective,
    VflowEdgeTemplateDirective,
    VflowEdgeLabelTemplateDirective,
    VflowHandleDirective,
    LabelEdgeIdComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  showCenter = signal(true);
  movable = signal<EdgeLabelPosition>('start');
  orient = signal<EdgeLabelOrient | undefined>('path');
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
    { id: 'c', point: { x: 300, y: 250 } },
    { id: 'd', point: { x: 0, y: 250 } },
  ]);
  edges: Edge[] = createEdges<{ label?: string }>([
    { id: 'template', source: 'a', target: 'b', curve: line, data: { label: 'Hello' } },
    {
      id: 'component',
      source: 'a',
      target: 'c',
      curve: line,
      component: LabelledEdgeComponent,
      data: { label: 'From component' },
    },
    { id: 'long-form', source: 'd', target: 'c', curve: line },
    { id: 'inside-svg', source: 'b', target: 'd', curve: line },
    { id: 'duplicate', source: 'c', target: 'a', curve: line },
    { id: 'along', source: 'a', target: 'd', curve: steep },
  ]);
}

describe('Edge labels declared inside edge presentations', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;
  let flow: VflowComponent;

  async function update() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function labelHost(selector: string) {
    return root.querySelector(selector)?.closest<HTMLElement>('[edgeLabelHost]') ?? null;
  }

  const labelHosts = () => root.querySelectorAll('[edgeLabelHost]').length;

  /** The browser rounds the serialized transform, so compare its numbers. */
  function expectAt(host: HTMLElement, point: { x: number; y: number }) {
    const match = /translate\(([-\d.e]+)px, ([-\d.e]+)px\)/.exec(host.style.transform);
    expect(match, host.style.transform).not.toBeNull();
    expect(Number(match![1])).toBeCloseTo(point.x, 2);
    expect(Number(match![2])).toBeCloseTo(point.y, 2);
  }

  function rotation(host: HTMLElement): number | null {
    const match = /rotate\(([-\d.e]+)deg\)/.exec(host.style.transform);
    return match ? Number(match[1]) : null;
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
    flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    await update();
  });

  it('renders an HTML label in the label layer at its point of the path', () => {
    const label = root.querySelector('.center-label')!;
    const host = labelHost('.center-label')!;

    expect(label instanceof HTMLElement).toBe(true);
    expect(label.textContent).toBe('Hello');
    expect(host.closest('.v-edge-labels-layer')).not.toBeNull();
    expect(host.closest('svg')).toBeNull();
    expectAt(host, POINTS.center);
  });

  it('updates label content that reads the edge data', async () => {
    fixture.componentInstance.edges[0].data!.set({ label: 'Changed' });
    await update();

    expect(root.querySelector('.center-label')!.textContent).toBe('Changed');
  });

  it.each(['Short', 'A significantly wider label that changed within one frame'])(
    'keeps a label centered on its point right after its content changes to "%s", at a zoom other than 1',
    async (label) => {
      await flow.setViewport({ x: 20, y: 10, zoom: 0.5 });
      await update();

      fixture.componentInstance.edges[0].data!.set({ label });
      fixture.detectChanges();

      const rect = root.querySelector('.center-label')!.parentElement!.getBoundingClientRect();
      const expected = flow.flowToClientPosition(POINTS.center);
      expect(rect.left + rect.width / 2).toBeCloseTo(expected.x, 1);
      expect(rect.top + rect.height / 2).toBeCloseTo(expected.y, 1);
    },
  );

  it('renders *vEdgeLabel without a value at the center', () => {
    expectAt(labelHost('.center-label')!, POINTS.center);
  });

  it('renders <ng-template vEdgeLabel> without a value at the center', () => {
    expect(root.querySelector('.long-form-label')?.textContent).toBe('Long form');
    expectAt(labelHost('.long-form-label')!, POINTS.center);
  });

  it('gives label content the edge through DI', () => {
    expect(root.querySelector('.movable-label')?.textContent).toBe('template');
  });

  it('moves a label when its position changes', async () => {
    expectAt(labelHost('.movable-label')!, POINTS.start);

    fixture.componentInstance.movable.set('end');
    await update();

    expectAt(labelHost('.movable-label')!, POINTS.end);
  });

  it('removes the label host when the label template is destroyed', async () => {
    const before = labelHosts();

    fixture.componentInstance.showCenter.set(false);
    await update();

    expect(root.querySelector('.center-label')).toBeNull();
    expect(labelHosts()).toBe(before - 1);
  });

  it('turns a label with orient path along the path, kept readable', () => {
    expect(rotation(labelHost('.along-label')!)).toBeCloseTo(120 - 180, 2);
  });

  it('keeps a label without an orient level on a curve that gives an angle', () => {
    expect(rotation(labelHost('.center-label')!)).toBeNull();
  });

  it.each([
    ['horizontal', 'horizontal' as const],
    ['no value', undefined],
  ])('levels a label whose orient changes to %s', async (_, orient) => {
    fixture.componentInstance.orient.set(orient);
    await update();

    expect(rotation(labelHost('.along-label')!)).toBeNull();
  });

  it('levels a label with orient path when the curve gives no angle', async () => {
    fixture.componentInstance.edges[5].curve!.set(withoutAngles);
    await update();

    expect(rotation(labelHost('.along-label')!)).toBeNull();
  });

  it('renders a label declared inside an edge component', () => {
    const label = root.querySelector('.component-label')!;

    expect(label instanceof HTMLElement).toBe(true);
    expect(label.textContent).toBe('From component');
    expect(label.closest('.v-edge-labels-layer')).not.toBeNull();
    expectAt(labelHost('.component-label')!, POINTS.end);
  });

  it('moves a label compiled in the SVG namespace into the HTML label layer, where it has no box', () => {
    const label = root.querySelector('.svg-label')!;

    expect(label.closest('.v-edge-labels-layer')).not.toBeNull();
    expect(label.getClientRects().length).toBe(0);
  });

  it('keeps the last label declared at a position', () => {
    expect(root.querySelector('.second-duplicate')).not.toBeNull();
    expect(root.querySelector('.first-duplicate')).toBeNull();
  });

  it('raises a label with its edge when the edge is selected', async () => {
    const edge = root.querySelectorAll<SVGElement>('svg[edge]')[0];
    const label = labelHost('.center-label')!;
    const before = Number(label.style.zIndex);

    fixture.componentInstance.edges[0].selected!.set(true);
    await update();

    expect(Number(label.style.zIndex)).toBeGreaterThan(before);
    expect(label.style.zIndex).toBe(edge.style.zIndex);
  });

  it('renders nothing for a curve without labelPoints', async () => {
    fixture.componentInstance.edges[2].curve!.set(() => ({ path: 'M 0,0 L 100,0' }));
    await update();

    expect(root.querySelector('.long-form-label')).toBeNull();
  });
});
