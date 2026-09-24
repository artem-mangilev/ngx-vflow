import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import {
  EdgeTemplateDirective,
  MarkerTemplateDirective,
  NodeTemplateDirective,
} from '../../directives/template.directive';
import { VflowHandleDirective } from '../../directives/handle.directive';

@Component({
  template: `<vflow [view]="[600, 400]" [nodes]="nodes" [edges]="edges()" [connection]="{ marker: 'diamond' }">
    <ng-template node>
      <div style="width: 60px; height: 30px">
        <span vflowHandle handleType="target" position="left"></span
        ><span vflowHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template let-ctx edge>
      <svg:path
        fill="none"
        [attr.d]="ctx.path()"
        [attr.marker-start]="ctx.markerStart()"
        [attr.marker-end]="ctx.markerEnd()" />
    </ng-template>
    <ng-template marker="diamond" inset="10">
      <svg:polygon fill="context-stroke" points="0,0 -5,-4 -10,0 -5,4" />
    </ng-template>
  </vflow>`,
  imports: [
    VflowComponent,
    NodeTemplateDirective,
    EdgeTemplateDirective,
    MarkerTemplateDirective,
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
  let warn: jasmine.Spy;

  function markerOf(url: string | null): SVGMarkerElement {
    const id = /^url\(#(.+)\)$/.exec(url ?? '')![1];
    return root.querySelector<SVGMarkerElement>(`defs[flowDefs] marker[id="${id}"]`)!;
  }

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    warn = spyOn(console, 'warn');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    await settle();
  });

  it('renders one marker element per distinct marker, with the stroke of the edge and a class per type', () => {
    const markers = Array.from(root.querySelectorAll('defs[flowDefs] marker'));

    // The diamond of the edge, the diamond of the connection line (default size) and the arrow.
    expect(markers.map((marker) => marker.getAttribute('class')).sort()).toEqual([
      'vflow-marker vflow-marker--arrow',
      'vflow-marker vflow-marker--diamond',
      'vflow-marker vflow-marker--diamond',
    ]);
    for (const marker of markers) {
      expect(marker.getAttribute('stroke')).toBe('context-stroke');
      expect(marker.getAttribute('stroke-width')).toBe('2');
      expect(marker.getAttribute('viewBox')).toBe('-10 -10 20 20');
    }
  });

  it('renders a declared shape inside the marker element of its type, at the inset it declares', () => {
    const path = root.querySelector('svg[edge] path[marker-start]')!;
    const diamond = markerOf(path.getAttribute('marker-start'));
    const arrow = markerOf(path.getAttribute('marker-end'));

    expect(diamond.getAttribute('refX')).toBe('-10');
    expect(diamond.getAttribute('markerWidth')).toBe('20');
    expect(diamond.querySelector('polygon')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(arrow.getAttribute('refX')).toBe('-2');
    expect(arrow.querySelector('polyline')).not.toBeNull();
  });

  it('warns about a marker type without a shape and renders it empty', async () => {
    fixture.componentInstance.edges.set(
      createEdges([{ id: 'unknown', source: 'a', target: 'b', markers: { end: 'hexagon' } }]),
    );
    await settle();

    const path = root.querySelector('svg[edge] path[marker-end]')!;
    const hexagon = markerOf(path.getAttribute('marker-end'));

    expect(hexagon.children.length).toBe(0);
    expect(hexagon.getAttribute('refX')).toBe('0');
    expect(warn).toHaveBeenCalledWith(jasmine.stringContaining('Marker type "hexagon" is not built in'));
  });
});
