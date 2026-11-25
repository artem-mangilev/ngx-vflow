import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import {
  VflowEdgeTemplateDirective,
  VflowMarkerTemplateDirective,
  VflowNodeTemplateDirective,
} from '../../public-directives/template.directive';
import { VflowHandleDirective } from '../../public-directives/handle.directive';

@Component({
  template: `<vflow
    style="width: 600px; height: 400px"
    [nodes]="nodes"
    [edges]="edges()"
    [connection]="{ markerEnd: 'diamond' }">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path
      *vEdge="let ctx"
      fill="none"
      [attr.d]="ctx.path()"
      [attr.marker-start]="ctx.markerStart()"
      [attr.marker-end]="ctx.markerEnd()" />
    <ng-template vMarker="diamond" inset="10">
      <svg:polygon fill="context-stroke" points="0,0 -5,-4 -10,0 -5,4" />
    </ng-template>
  </vflow>`,
  imports: [
    VflowComponent,
    VflowNodeTemplateDirective,
    VflowEdgeTemplateDirective,
    VflowMarkerTemplateDirective,
    VflowHandleDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
  ]);
  edges = signal<Edge[]>(
    createEdges([
      { id: 'custom', source: 'a', target: 'b', markers: { start: { type: 'diamond', width: 20 }, end: 'arrow' } },
    ]),
  );
}

describe('Flow defs', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  function markerOf(url: string | null): SVGMarkerElement {
    const id = /^url\(#(.+)\)$/.exec(url ?? '')![1];
    return root.querySelector<SVGMarkerElement>(`defs[flowDefs] marker[id="${id}"]`)!;
  }

  const markers = () => Array.from(root.querySelectorAll('defs[flowDefs] marker'));

  async function update() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    await update();
  });

  it('renders one marker element per distinct marker, with its type as an attribute', () => {
    // The diamond of the edge, the diamond of the connection line (default size) and the arrow.
    expect(
      markers()
        .map((marker) => marker.getAttribute('data-v-marker'))
        .sort(),
    ).toEqual(['arrow', 'diamond', 'diamond']);
  });

  it('draws every marker with the stroke of its edge, in user space and the shared viewBox', () => {
    expect(
      markers().map((marker) => [
        marker.getAttribute('stroke'),
        marker.getAttribute('viewBox'),
        marker.getAttribute('markerUnits'),
      ]),
    ).toEqual(Array(3).fill(['context-stroke', '-10 -10 20 20', 'userSpaceOnUse']));
  });

  it('keeps the stroke of a marker 2 flow units wide whatever its size', () => {
    const rendered = markers().map(
      (marker) => (Number(marker.getAttribute('stroke-width')) * Number(marker.getAttribute('markerWidth'))) / 20,
    );

    expect(rendered).toEqual([2, 2, 2].map((width) => expect.closeTo(width)));
  });

  it('renders a declared shape inside the marker element of its type, at the inset it declares', () => {
    const diamond = markerOf(root.querySelector('svg[edge] path[marker-start]')!.getAttribute('marker-start'));

    expect(diamond.getAttribute('refX')).toBe('-10');
    expect(diamond.getAttribute('markerWidth')).toBe('20');
    expect(diamond.querySelector('polygon')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('renders the built-in arrow inside its marker element', () => {
    const arrow = markerOf(root.querySelector('svg[edge] path[marker-end]')!.getAttribute('marker-end'));

    expect(arrow.getAttribute('refX')).toBe('-2');
    expect(arrow.querySelector('polyline')).not.toBeNull();
  });

  it('renders a marker type without a shape empty', async () => {
    fixture.componentInstance.edges.set(
      createEdges([{ id: 'unknown', source: 'a', target: 'b', markers: { end: 'hexagon' } }]),
    );
    await update();

    const hexagon = markerOf(root.querySelector('svg[edge] path[marker-end]')!.getAttribute('marker-end'));

    expect(hexagon.children.length).toBe(0);
    expect(hexagon.getAttribute('refX')).toBe('0');
  });

  it('renders another marker of the same type in a new marker element', async () => {
    fixture.componentInstance.edges.set(
      createEdges([
        { id: 'narrow', source: 'a', target: 'b', markers: { end: 'hexagon' } },
        { id: 'wide', source: 'b', target: 'a', markers: { end: { type: 'hexagon', width: 40 } } },
      ]),
    );
    await update();

    expect(root.querySelectorAll('defs[flowDefs] marker[data-v-marker=hexagon]').length).toBe(2);
  });
});
