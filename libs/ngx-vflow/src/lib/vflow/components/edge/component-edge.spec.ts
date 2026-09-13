import { ChangeDetectionStrategy, Component, output, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { AnyComponentEdgeEvent } from '../../interfaces/component-edge-event.interface';
import { AnyComponentNodeEvent } from '../../interfaces/component-node-event.interface';
import { EdgeTemplateDirective, NodeTemplateDirective } from '../../directives/template.directive';
import { HandleComponent } from '../../public-components/handle/handle.component';
import { CustomEdgeComponent } from '../../public-components/custom-edge/custom-edge.component';
import { injectEdge } from '../../utils/inject-edge';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

@Component({
  // The flow creates the SVG host itself, so this selector is only documentation.
  selector: 'g[probeEdge]',
  template: `<svg:g customEdge><svg:path class="probe-path" fill="none" [attr.d]="ctx.path()" /></svg:g>`,
  host: { class: 'probe-edge', '[attr.data-edge]': 'ctx.edge.id' },
  imports: [CustomEdgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ProbeEdgeComponent {
  static instances: ProbeEdgeComponent[] = [];

  readonly ctx = injectEdge<{ color?: string }>();
  readonly picked = output<string>();

  constructor() {
    ProbeEdgeComponent.instances.push(this);
  }
}

@Component({
  selector: 'g[templateEdgeChild]',
  template: `<svg:path class="template-edge-child" [attr.data-edge]="ctx.edge.id" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateEdgeChildComponent {
  readonly ctx = injectEdge();
}

@Component({
  template: `<vflow
    [view]="[500, 300]"
    [nodes]="nodes"
    [edges]="edges"
    (componentEdgeEvent)="edgeEvents.push($event)"
    (componentNodeEvent)="nodeEvents.push($event)">
    <ng-template node>
      <div style="width: 60px; height: 30px">
        <handle type="target" position="left" /><handle type="source" position="right" />
      </div>
    </ng-template>
    <ng-template edge><svg:g templateEdgeChild /></ng-template>
  </vflow>`,
  imports: [VflowComponent, NodeTemplateDirective, EdgeTemplateDirective, HandleComponent, TemplateEdgeChildComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  edgeEvents: AnyComponentEdgeEvent[] = [];
  nodeEvents: AnyComponentNodeEvent[] = [];
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
    { id: 'c', point: { x: 200, y: 150 } },
    { id: 'd', point: { x: 0, y: 150 } },
  ]);
  edges: Edge[] = createEdges<{ color?: string }>([
    { id: 'class', source: 'a', target: 'b', component: ProbeEdgeComponent, data: { color: 'red' } },
    { id: 'lazy', source: 'a', target: 'c', component: () => Promise.resolve(ProbeEdgeComponent) },
    { id: 'template', source: 'd', target: 'c' },
  ]);
}

describe('Component edges', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    ProbeEdgeComponent.instances = [];
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders edge components and lazy factories on a library-created SVG group inside the edge SVG', () => {
    const hosts = Array.from(root.querySelectorAll<SVGGElement>('g.probe-edge'));

    expect(hosts.map((host) => host.getAttribute('data-edge'))).toEqual(['class', 'lazy']);
    for (const host of hosts) {
      expect(host instanceof SVGGElement).toBeTrue();
      expect(host.namespaceURI).toBe(SVG_NAMESPACE);
      expect(host.closest('svg[edge]')).not.toBeNull();
    }

    const path = hosts[0].querySelector('path.probe-path');
    expect(path instanceof SVGPathElement).toBeTrue();
    expect(path?.getAttribute('d')).toMatch(/^M/);
    expect(hosts[0].querySelector('path.interactive-edge')).not.toBeNull();
  });

  it('gives the edge context to edge components and to components inside an edge template', () => {
    expect(ProbeEdgeComponent.instances.map((probe) => probe.ctx.edge.id).sort()).toEqual(['class', 'lazy']);
    expect(ProbeEdgeComponent.instances.find((probe) => probe.ctx.edge.id === 'class')?.ctx.data()).toEqual({
      color: 'red',
    });
    expect(root.querySelector('path.template-edge-child')?.getAttribute('data-edge')).toBe('template');
  });

  it('forwards edge component outputs as edge events, separately from node events', () => {
    ProbeEdgeComponent.instances.find((probe) => probe.ctx.edge.id === 'class')!.picked.emit('hello');

    expect(fixture.componentInstance.edgeEvents).toEqual([
      { edgeId: 'class', eventName: 'picked', eventPayload: 'hello' },
    ]);
    expect(fixture.componentInstance.nodeEvents).toEqual([]);
  });
});
