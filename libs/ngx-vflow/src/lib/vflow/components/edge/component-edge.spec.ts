import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { AnyComponentEdgeEvent } from '../../interfaces/component-edge-event.interface';
import { AnyComponentNodeEvent } from '../../interfaces/component-node-event.interface';
import { VflowEdgeTemplateDirective, VflowNodeTemplateDirective } from '../../public-directives/template.directive';
import { VflowHandleDirective } from '../../public-directives/handle.directive';
import { injectEdge } from '../../utils/inject-edge';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Renders the fixture and waits for the first layout of its flow. */
async function render<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
  await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
  fixture.detectChanges();
  await fixture.whenStable();
}

const click = (target: Element) => target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

@Component({
  // The flow creates the SVG host itself, so this selector is only documentation.
  selector: 'g[probeEdge]',
  template: `<svg:path class="probe-path" fill="none" [attr.d]="ctx.path()" />`,
  host: { class: 'probe-edge', '[attr.data-edge]': 'ctx.edge.id', '(click)': 'clicks = clicks + 1' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ProbeEdgeComponent {
  readonly ctx = injectEdge<{ color?: string }>();
  readonly picked = output<string>();
  clicks = 0;
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
    style="width: 500px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    (componentEdgeEvent)="edgeEvents.push($event)"
    (componentNodeEvent)="nodeEvents.push($event)">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
    <svg:g *vEdge="let ctx" templateEdgeChild (click)="templateClicks.push(ctx.edge.id)" />
  </vflow>`,
  imports: [
    VflowComponent,
    VflowNodeTemplateDirective,
    VflowEdgeTemplateDirective,
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

  const edgeHosts = () => Array.from(root.querySelectorAll<SVGSVGElement>('svg[edge]'));
  const probe = (id: string) =>
    fixture.debugElement
      .queryAll(By.directive(ProbeEdgeComponent))
      .map((element) => element.componentInstance as ProbeEdgeComponent)
      .find((instance) => instance.ctx.edge.id === id)!;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement;
    await render(fixture);
    // The lazy factory resolves after the first layout.
    await expect.poll(() => root.querySelectorAll('g.probe-edge').length).toBe(2);
  });

  it('renders edge components and lazy factories on a library-created SVG group inside the edge SVG', () => {
    const hosts = Array.from(root.querySelectorAll<SVGGElement>('g.probe-edge'));

    expect(hosts.map((host) => host.getAttribute('data-edge'))).toEqual(['class', 'lazy']);
    expect(hosts.map((host) => [host instanceof SVGGElement, host.namespaceURI, !!host.closest('svg[edge]')])).toEqual([
      [true, SVG_NAMESPACE, true],
      [true, SVG_NAMESPACE, true],
    ]);
  });

  it('gives an edge component the path of its edge', () => {
    const path = root.querySelector('g.probe-edge path.probe-path');

    expect(path instanceof SVGPathElement).toBe(true);
    expect(path?.getAttribute('d')).toMatch(/^M/);
  });

  it('puts the interaction stroke first inside component hosts and the root group of a template', () => {
    const strokes = edgeHosts()
      .slice(0, 3)
      .map((svg) => {
        const stroke = svg.querySelector<SVGGElement>(':scope > g')!.firstElementChild as SVGPathElement;
        return {
          outsideRootGroup: !!svg.querySelector(':scope > path[data-v-interactive-edge]'),
          interactive: stroke.hasAttribute('data-v-interactive-edge'),
          namespace: stroke.namespaceURI,
          drawn: /^M/.test(stroke.getAttribute('d') ?? ''),
          width: stroke.style.strokeWidth,
          pointerEvents: stroke.style.pointerEvents,
        };
      });

    expect(strokes).toEqual(
      Array(3).fill({
        outsideRootGroup: false,
        interactive: true,
        namespace: SVG_NAMESPACE,
        drawn: true,
        width: '20px',
        pointerEvents: 'stroke',
      }),
    );
  });

  it('hit-tests a point near the line to the stroke inside the root group, so the group is hovered', () => {
    const svg = edgeHosts()[2];
    const rect = svg.querySelector('path[data-v-interactive-edge]')!.getBoundingClientRect();
    // The edge is a horizontal line; 8px below it is off the visible path and inside the 20px stroke.
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2 + 8);

    expect(hit?.hasAttribute('data-v-interactive-edge')).toBe(true);
    expect(hit?.parentElement).toBe(svg.querySelector(':scope > g'));
  });

  it('delivers a click on the stroke of a template edge to the template listener', () => {
    click(edgeHosts()[2].querySelector('path[data-v-interactive-edge]')!);

    expect(fixture.componentInstance.templateClicks).toEqual(['template']);
  });

  it('selects a template edge by a click on its stroke', () => {
    click(edgeHosts()[2].querySelector('path[data-v-interactive-edge]')!);

    expect(fixture.componentInstance.edges.map((edge) => edge.selected!())).toEqual([false, false, true, false]);
  });

  it('delivers a click on the stroke of an edge component to its host listener and selects the edge', () => {
    click(edgeHosts()[0].querySelector('path[data-v-interactive-edge]')!);

    expect(probe('class').clicks).toBe(1);
    expect(fixture.componentInstance.edges[0].selected!()).toBe(true);
  });

  it('hides the stroke at interaction width 0', () => {
    const bare = edgeHosts()[3];

    expect(bare.querySelector<SVGPathElement>('path[data-v-interactive-edge]')!.style.display).toBe('none');
  });

  it('selects an edge without a stroke by a click on a presentation element', () => {
    click(edgeHosts()[3].querySelector('path.template-edge-child')!);

    expect(fixture.componentInstance.edges[3].selected!()).toBe(true);
  });

  it('gives the edge context to edge components', () => {
    expect([probe('class').ctx.data(), probe('lazy').ctx.edge.id]).toEqual([{ color: 'red' }, 'lazy']);
  });

  it('gives the edge context to components inside an edge template', () => {
    expect(root.querySelector('path.template-edge-child')?.getAttribute('data-edge')).toBe('template');
  });

  it('forwards edge component outputs as edge events, separately from node events', () => {
    probe('class').picked.emit('hello');

    expect(fixture.componentInstance.edgeEvents).toEqual([
      { edgeId: 'class', component: ProbeEdgeComponent, eventName: 'picked', eventPayload: 'hello' },
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
  readonly ctx = injectEdge();
  clicks = 0;
}

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" [edges]="edges">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
    <ng-template let-ctx vEdge>
      @if (ctx.edge.id === 'grouped') {
        <svg:g>
          <svg:path class="line" fill="none" [attr.d]="ctx.path()" />
        </svg:g>
      } @else {
        <svg:path class="line" fill="none" [attr.d]="ctx.path()" />
      }
    </ng-template>
  </vflow>`,
  imports: [VflowComponent, VflowNodeTemplateDirective, VflowEdgeTemplateDirective, VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainTemplateHostComponent {
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
    { id: 'c', point: { x: 200, y: 120 } },
    { id: 'd', point: { x: 0, y: 200 } },
  ]);
  edges: Edge[] = createEdges([
    { id: 'plain', source: 'a', target: 'b', selectable: true },
    { id: 'plain-component', source: 'a', target: 'c', component: PlainEdgeComponent, selectable: true },
    { id: 'grouped', source: 'a', target: 'd', selectable: true },
  ]);
}

@Component({
  template: `<vflow style="width: 400px; height: 200px" [nodes]="nodes" [edges]="edges">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
    <ng-template let-ctx vEdge>
      <svg:g class="spaced"><svg:path fill="none" [attr.d]="ctx.path()" /></svg:g>
    </ng-template>
  </vflow>`,
  imports: [VflowComponent, VflowNodeTemplateDirective, VflowEdgeTemplateDirective, VflowHandleDirective],
  preserveWhitespaces: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PreservedWhitespaceHostComponent {
  nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
  ]);
  edges: Edge[] = createEdges([{ id: 'spaced', source: 'a', target: 'b' }]);
}

describe('Edges without opt-in', () => {
  it('finds the root group of a template behind preserved whitespace', async () => {
    const fixture = TestBed.createComponent(PreservedWhitespaceHostComponent);
    await render(fixture);

    const group = fixture.nativeElement.querySelector('svg[edge] > g.spaced') as SVGGElement;
    expect((group.firstElementChild as SVGElement).hasAttribute('data-v-interactive-edge')).toBe(true);
  });

  describe('a template that starts with a path, control flow, or an edge component', () => {
    let fixture: ComponentFixture<PlainTemplateHostComponent>;
    let svgs: SVGSVGElement[];
    let strokes: SVGPathElement[];

    const plainComponent = () =>
      fixture.debugElement.query(By.directive(PlainEdgeComponent)).componentInstance as PlainEdgeComponent;

    beforeEach(async () => {
      fixture = TestBed.createComponent(PlainTemplateHostComponent);
      await render(fixture);
      svgs = Array.from(fixture.nativeElement.querySelectorAll('svg[edge]'));
      strokes = [
        svgs[0].querySelector<SVGPathElement>(':scope > path[data-v-interactive-edge]')!,
        svgs[1].querySelector<SVGPathElement>(':scope > g > path[data-v-interactive-edge]:first-child')!,
        svgs[2].querySelector<SVGPathElement>(':scope > path[data-v-interactive-edge]')!,
      ];
    });

    it('draws one stroke per edge: in the edge host for a path or control flow, in the host of a component', () => {
      expect(strokes.map((stroke) => stroke !== null)).toEqual([true, true, true]);
      expect(svgs.map((svg) => svg.querySelectorAll('path[data-v-interactive-edge]').length)).toEqual([1, 1, 1]);
    });

    it('draws the stroke along the path of the edge', () => {
      expect(strokes.map((stroke) => stroke.getAttribute('d'))).toEqual(
        svgs.map((svg) => svg.querySelector('path.v-focus-indicator')!.getAttribute('d')),
      );
    });

    it('keeps the stroke out of a group inside control flow, which can be destroyed without the view', () => {
      expect(svgs[2].querySelector('g > [data-v-interactive-edge]')).toBeNull();
    });

    it('keeps the presentation above the stroke', () => {
      const line = svgs[0].querySelector('.line')!;

      expect(strokes[0].compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('selects an edge by a click on a template path', () => {
      click(svgs[0].querySelector('path.line')!);

      expect(fixture.componentInstance.edges[0].selected!()).toBe(true);
    });

    it('selects an edge by a click on the stroke of a template that starts with control flow', () => {
      click(strokes[2]);

      expect(fixture.componentInstance.edges[2].selected!()).toBe(true);
    });

    it('selects an edge component by a click on its presentation and delivers the click to its host', () => {
      click(svgs[1].querySelector('path.plain-component')!);

      expect(fixture.componentInstance.edges[1].selected!()).toBe(true);
      expect(plainComponent().clicks).toBe(1);
    });

    it('delivers a click near the line to the host listener of an edge component, through the stroke', () => {
      click(strokes[1]);

      expect(plainComponent().clicks).toBe(1);
    });

    it('shows the pointer cursor on the stroke of a selectable edge', () => {
      expect(strokes.map((stroke) => getComputedStyle(stroke).cursor)).toEqual(['pointer', 'pointer', 'pointer']);
    });

    it('keeps the stroke of an edge that cannot be selected, without the pointer cursor', async () => {
      fixture.componentInstance.edges.forEach((edge) => edge.selectable!.set(false));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(strokes.every((stroke) => stroke.isConnected)).toBe(true);
      expect(strokes.map((stroke) => getComputedStyle(stroke).cursor)).not.toContain('pointer');
    });
  });
});
