import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { AnyComponentEdgeEvent } from '../../interfaces/component-edge-event.interface';
import { AnyComponentNodeEvent } from '../../interfaces/component-node-event.interface';
import { VflowEdgeTemplateDirective, VflowNodeTemplateDirective } from '../../directives/template.directive';
import { VflowHandleDirective } from '../../directives/handle.directive';
import { injectEdge } from '../../utils/inject-edge';
import { VflowEdgeInteractionDirective } from '../../directives/edge-interaction.directive';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

@Component({
  // The flow creates the SVG host itself, so this selector is only documentation.
  selector: 'g[probeEdge]',
  hostDirectives: [VflowEdgeInteractionDirective],
  template: `<svg:path class="probe-path" fill="none" [attr.d]="ctx.path()" />`,
  host: { class: 'probe-edge', '[attr.data-edge]': 'ctx.edge.id', '(click)': 'clicks = clicks + 1' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ProbeEdgeComponent {
  static instances: ProbeEdgeComponent[] = [];

  readonly ctx = injectEdge<{ color?: string }>();
  readonly picked = output<string>();
  clicks = 0;

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
    <ng-template vNode>
      <div style="width: 60px; height: 30px">
        <span vHandle handleType="target" position="left"></span
        ><span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template let-ctx vEdge>
      <svg:g vEdgeInteraction templateEdgeChild (click)="templateClicks.push(ctx.edge.id)" />
    </ng-template>
  </vflow>`,
  imports: [
    VflowComponent,
    VflowNodeTemplateDirective,
    VflowEdgeTemplateDirective,
    VflowEdgeInteractionDirective,
    VflowHandleDirective,
    TemplateEdgeChildComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  edgeEvents: AnyComponentEdgeEvent[] = [];
  nodeEvents: AnyComponentNodeEvent[] = [];
  templateClicks: string[] = [];
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
    { id: 'bare', source: 'b', target: 'd', interactionWidth: 0 },
  ]);
}

describe('Component edges', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    ProbeEdgeComponent.instances = [];
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
      expect(host instanceof SVGGElement).toBe(true);
      expect(host.namespaceURI).toBe(SVG_NAMESPACE);
      expect(host.closest('svg[edge]')).not.toBeNull();
    }

    const path = hosts[0].querySelector('path.probe-path');
    expect(path instanceof SVGPathElement).toBe(true);
    expect(path?.getAttribute('d')).toMatch(/^M/);
  });

  it('puts the interaction stroke first inside component hosts and vEdgeInteraction groups', () => {
    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>('svg[edge]'));

    for (const svg of svgs.slice(0, 3)) {
      expect(svg.querySelector(':scope > path.v-interactive-edge')).toBeNull();
      const presentationRoot = svg.querySelector<SVGGElement>(':scope > g')!;
      const stroke = presentationRoot.firstElementChild as SVGPathElement;
      expect(stroke.classList.contains('v-interactive-edge')).toBe(true);
      expect(stroke.namespaceURI).toBe(SVG_NAMESPACE);
      expect(stroke.getAttribute('d')).toMatch(/^M/);
      expect(stroke.style.strokeWidth).toBe('20px');
      expect(stroke.style.pointerEvents).toBe('stroke');
    }
  });

  it('delivers clicks on the stroke to presentation listeners and selects the edge', () => {
    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>('svg[edge]'));
    const { edges } = fixture.componentInstance;

    svgs[2].querySelector('path.v-interactive-edge')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.templateClicks).toEqual(['template']);
    expect(edges.map((edge) => edge.selected!())).toEqual([false, false, true, false]);

    svgs[0].querySelector('path.v-interactive-edge')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ProbeEdgeComponent.instances.find((probe) => probe.ctx.edge.id === 'class')!.clicks).toBe(1);
    expect(edges[0].selected!()).toBe(true);
  });

  it('hides the stroke at width 0 and still selects the edge from a presentation element', () => {
    const bare = Array.from(root.querySelectorAll<SVGSVGElement>('svg[edge]'))[3];

    expect(bare.querySelector(':scope > path.v-interactive-edge')).toBeNull();
    expect(bare.querySelector<SVGPathElement>('path.v-interactive-edge')!.style.display).toBe('none');
    bare.querySelector('path.template-edge-child')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.edges[3].selected!()).toBe(true);
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

@Component({
  selector: 'g[plainEdge]',
  host: { '(click)': 'clicks = clicks + 1' },
  template: `<svg:path class="plain-component" fill="none" [attr.d]="ctx.path()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainEdgeComponent {
  static instances: PlainEdgeComponent[] = [];

  readonly ctx = injectEdge();
  clicks = 0;

  constructor() {
    PlainEdgeComponent.instances.push(this);
  }
}

@Component({
  template: `<vflow [view]="[400, 200]" [nodes]="nodes" [edges]="edges">
    <ng-template vNode>
      <div style="width: 60px; height: 30px">
        <span vHandle handleType="target" position="left"></span
        ><span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template let-ctx vEdge><svg:path class="plain" fill="none" [attr.d]="ctx.path()" /></ng-template>
  </vflow>`,
  imports: [VflowComponent, VflowNodeTemplateDirective, VflowEdgeTemplateDirective, VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainTemplateHostComponent {
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
    { id: 'c', point: { x: 200, y: 120 } },
  ]);
  edges: Edge[] = createEdges([
    { id: 'plain', source: 'a', target: 'b' },
    { id: 'plain-component', source: 'a', target: 'c', component: PlainEdgeComponent },
  ]);
}

describe('Edges without vEdgeInteraction', () => {
  it('draws no interaction stroke without vEdgeInteraction and still selects from presentation elements', async () => {
    PlainEdgeComponent.instances = [];
    const fixture = TestBed.createComponent(PlainTemplateHostComponent);
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();

    const svgs = Array.from(fixture.nativeElement.querySelectorAll('svg[edge]')) as SVGSVGElement[];
    expect(svgs.length).toBe(2);
    for (const svg of svgs) {
      expect(svg.querySelector('path.v-interactive-edge')).toBeNull();
    }

    svgs[0].querySelector('path.plain')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.edges[0].selected!()).toBe(true);

    svgs[1].querySelector('path.plain-component')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fixture.componentInstance.edges[1].selected!()).toBe(true);
    expect(PlainEdgeComponent.instances[0].clicks).toBe(1);
  });
});
