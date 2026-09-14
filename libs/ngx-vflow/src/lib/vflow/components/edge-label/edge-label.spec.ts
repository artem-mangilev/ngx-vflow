import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { EdgeLabelPosition } from '../../interfaces/edge-label.interface';
import {
  EdgeLabelTemplateDirective,
  EdgeTemplateDirective,
  NodeTemplateDirective,
} from '../../directives/template.directive';
import { HandleComponent } from '../../public-components/handle/handle.component';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { injectEdge } from '../../utils/inject-edge';

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
  imports: [EdgeLabelTemplateDirective],
  template: `
    <svg:path fill="none" [attr.d]="ctx.path()" />
    <span *edgeLabel="'end'" class="component-label">{{ ctx.data().label }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelledEdgeComponent {
  readonly ctx = injectEdge<{ label: string }>();
}

@Component({
  template: `<vflow [view]="[600, 400]" [nodes]="nodes" [edges]="edges">
    <ng-template node>
      <div style="width: 60px; height: 30px">
        <handle type="target" position="left" /><handle type="source" position="right" />
      </div>
    </ng-template>
    <ng-template let-ctx edge>
      <svg:g><svg:path fill="none" [attr.d]="ctx.path()" /></svg:g>
      @switch (ctx.edge.id) {
        @case ('template') {
          @if (showCenter()) {
            <span *edgeLabel class="center-label">{{ ctx.data().label }}</span>
          }
          <ng-template [edgeLabel]="movable()">
            <span class="movable-label"><label-edge-id /></span>
          </ng-template>
        }
        @case ('long-form') {
          <ng-template edgeLabel><span class="long-form-label">Long form</span></ng-template>
        }
        @case ('inside-svg') {
          <svg:g><span *edgeLabel class="svg-label">Inside SVG</span></svg:g>
        }
        @case ('duplicate') {
          <span *edgeLabel class="first-duplicate">First</span>
          <span *edgeLabel class="second-duplicate">Second</span>
        }
      }
    </ng-template>
  </vflow>`,
  imports: [
    VflowComponent,
    NodeTemplateDirective,
    EdgeTemplateDirective,
    EdgeLabelTemplateDirective,
    HandleComponent,
    LabelEdgeIdComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  showCenter = signal(true);
  movable = signal<EdgeLabelPosition>('start');
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
    { id: 'c', point: { x: 300, y: 250 } },
    { id: 'd', point: { x: 0, y: 250 } },
  ]);
  edges: Edge[] = createEdges<{ label?: string }>([
    { id: 'template', source: 'a', target: 'b', data: { label: 'Hello' } },
    { id: 'component', source: 'a', target: 'c', component: LabelledEdgeComponent, data: { label: 'From component' } },
    { id: 'long-form', source: 'd', target: 'c' },
    { id: 'inside-svg', source: 'b', target: 'd' },
    { id: 'duplicate', source: 'c', target: 'a' },
  ]);
}

describe('Edge labels declared inside edge presentations', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;
  let warn: jasmine.Spy;

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  function edgeModel(id: string) {
    const entities = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowEntitiesService);
    return entities.edges().find((model) => model.edge.id === id)!;
  }

  function positions(id: string) {
    return Object.keys(edgeModel(id).labelTemplates()).sort();
  }

  function labelHost(selector: string) {
    return root.querySelector(selector)?.closest<HTMLElement>('[edgeLabelHost]') ?? null;
  }

  /** The browser rounds the serialized transform, so compare its numbers. */
  function expectAt(host: HTMLElement, point: { x: number; y: number }) {
    const match = /translate\(([-\d.e]+)px, ([-\d.e]+)px\)/.exec(host.style.transform);
    expect(match).withContext(host.style.transform).not.toBeNull();
    expect(Number(match![1])).toBeCloseTo(point.x, 2);
    expect(Number(match![2])).toBeCloseTo(point.y, 2);
  }

  beforeEach(async () => {
    warn = spyOn(console, 'warn');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    await settle();
  });

  it('renders a label in the label layer at its point of the path and closes over the edge context', async () => {
    const label = root.querySelector('.center-label')!;
    const host = labelHost('.center-label')!;
    const point = edgeModel('template').path().labelPoints!.center;

    expect(label instanceof HTMLElement).toBeTrue();
    expect(label.textContent).toBe('Hello');
    expect(host.closest('.vflow-edge-labels-layer')).not.toBeNull();
    expect(host.closest('svg')).toBeNull();
    expectAt(host, point);

    fixture.componentInstance.edges[0].data!.set({ label: 'Changed' });
    await settle();
    expect(root.querySelector('.center-label')!.textContent).toBe('Changed');
  });

  it('registers *edgeLabel and <ng-template edgeLabel> without a value at the center', () => {
    expect(positions('template')).toEqual(['center', 'start']);
    expect(positions('long-form')).toEqual(['center']);
    expect(root.querySelector('.long-form-label')?.textContent).toBe('Long form');
  });

  it('gives label content the edge through DI', () => {
    expect(root.querySelector('.movable-label')?.textContent).toBe('template');
    expect(labelHost('.movable-label')!.style.transform).not.toBe('');
  });

  it('moves a label when its position changes and unregisters it when its template is destroyed', async () => {
    fixture.componentInstance.movable.set('end');
    await settle();
    const end = edgeModel('template').path().labelPoints!.end;
    expect(positions('template')).toEqual(['center', 'end']);
    expectAt(labelHost('.movable-label')!, end);

    fixture.componentInstance.showCenter.set(false);
    await settle();
    expect(positions('template')).toEqual(['end']);
    expect(root.querySelector('.center-label')).toBeNull();
    expect(root.querySelectorAll('[edgeLabelHost]').length).toBe(
      ['template', 'component', 'long-form', 'inside-svg', 'duplicate']
        .map((id) => positions(id).length)
        .reduce((sum, count) => sum + count, 0),
    );
  });

  it('renders a label declared inside an edge component', () => {
    const label = root.querySelector('.component-label')!;

    expect(positions('component')).toEqual(['end']);
    expect(label instanceof HTMLElement).toBeTrue();
    expect(label.textContent).toBe('From component');
    expect(label.closest('.vflow-edge-labels-layer')).not.toBeNull();
  });

  it('warns about a label compiled in the SVG namespace', () => {
    const label = root.querySelector('.svg-label')!;

    expect(label.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(label instanceof HTMLElement).toBeFalse();
    expect(warn).toHaveBeenCalledWith(jasmine.stringContaining('label of edge "inside-svg" was compiled in the SVG'));
  });

  it('keeps the last label declared at a position and warns about the duplicate', () => {
    expect(positions('duplicate')).toEqual(['center']);
    expect(root.querySelector('.second-duplicate')).not.toBeNull();
    expect(root.querySelector('.first-duplicate')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      jasmine.stringContaining('Edge "duplicate" declares more than one label at "center"'),
    );
  });

  it('warns and renders nothing for a curve without labelPoints', async () => {
    fixture.componentInstance.edges[2].curve!.set(() => ({ path: 'M 0,0 L 100,0' }));
    await settle();

    expect(root.querySelector('.long-form-label')).toBeNull();
    expect(warn).toHaveBeenCalledWith(jasmine.stringContaining('Edge "long-form" uses a curve without labelPoints'));
  });
});
