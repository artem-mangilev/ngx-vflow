import { ChangeDetectionStrategy, Component, Type, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ConnectionSettings,
  Edge,
  Node,
  Vflow,
  VflowComponent,
  VflowConnectionTemplateDirective,
  VflowDragHandleDirective,
  VflowEdgeInteractionDirective,
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowHandleDirective,
  VflowMarkerTemplateDirective,
  VflowMinimapComponent,
  VflowNodeTemplateDirective,
  VflowNodeToolbarComponent,
  VflowResizableComponent,
  VflowSelectableDirective,
  createEdges,
  createNodes,
} from 'ngx-vflow';
import { VflowMocks } from './vflow-mocks';
import { VflowMockComponent } from './component-mocks/vflow-mock.component';
import { VflowHandleMockDirective } from './directive-mocks/handle-mock.directive';
import { VflowResizableMockComponent } from './component-mocks/resizable-mock.component';
import { VflowSelectableMockDirective } from './directive-mocks/selectable-mock.directive';
import { VflowEdgeInteractionMockDirective } from './directive-mocks/edge-interaction-mock.directive';
import { VflowMinimapMockComponent } from './component-mocks/minimap-mock.component';
import { VflowNodeToolbarMockComponent } from './component-mocks/node-toolbar-mock.component';
import { VflowDragHandleMockDirective } from './directive-mocks/drag-handle-mock.directive';
import {
  VflowConnectionTemplateMockDirective,
  VflowEdgeLabelTemplateMockDirective,
  VflowEdgeTemplateMockDirective,
  VflowMarkerTemplateMockDirective,
  VflowNodeTemplateMockDirective,
} from './directive-mocks/template-mock.directive';

@Component({
  template: `
    <vflow
      #vflow
      [nodes]="nodes"
      [edges]="edges"
      [view]="'auto'"
      [minZoom]="0.5"
      [maxZoom]="2"
      [background]="'#fff'"
      [optimization]="{ detachedGroupsLayer: true }"
      [nodesSelectable]="true"
      [edgesSelectable]="true"
      [nodesFocusable]="true"
      [edgesFocusable]="true"
      [keyboardShortcuts]="{ modifiers: { multiSelection: [] } }"
      [connection]="connection"
      [snapGrid]="[1, 1]"
      [elevateNodesOnSelect]="true"
      (componentNodeEvent)="(null)"
      (nodesChanges)="(null)"
      (edgesChanges.select)="(null)"
      (connect)="connections.push($event)">
      <ng-template let-ctx vNode>
        <div class="node" vDragHandle vSelectable vResizable [gap]="2">
          {{ ctx.node.id }}
          <span vHandle handleType="source" #handle="vHandle" [position]="'left'" [handleId]="'1'" [layout]="'manual'">
            {{ handle.state() }}
          </span>

          <v-node-toolbar position="left">
            <button>Delete</button>
          </v-node-toolbar>
        </div>
      </ng-template>

      <ng-template let-ctx vEdge>
        <svg:g vEdgeInteraction>
          <svg:path fill="none" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
        </svg:g>
        <span class="edge-label" *vEdgeLabel="'start'">{{ ctx.edge.id }}</span>
      </ng-template>

      <ng-template let-ctx vConnection>
        <svg:path fill="none" [attr.d]="ctx.path()" [attr.stroke]="ctx.marker()" />
      </ng-template>

      <ng-template vMarker="all-mocks-circle" inset="9">
        <svg:circle fill="none" cx="-5" cy="0" r="4" />
      </ng-template>

      <v-minimap [pannable]="true" [zoomable]="true" [zoomStep]="0.2" [position]="'bottom-right'" />
    </vflow>
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FlowHostComponent {
  public readonly vflow = viewChild.required<VflowComponent>('vflow');

  public readonly nodes: Node[] = createNodes([
    { id: 'parent', point: { x: 10, y: 20 }, width: 200, height: 100 },
    { id: 'child', point: { x: 5, y: 5 }, width: 50, height: 40, parentId: 'parent' },
    { id: 'auto', point: { x: 400, y: 0 } },
  ]);

  public readonly edges: Edge[] = createEdges([{ id: 'parent-auto', source: 'parent', target: 'auto' }]);

  public readonly connection: ConnectionSettings = {};

  public readonly connections: unknown[] = [];
}

function renderWithMocks() {
  TestBed.configureTestingModule({
    imports: [FlowHostComponent],
    // A mock that lacks an input or a selector of the real directive fails the test instead of logging.
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  }).overrideComponent(FlowHostComponent, { remove: { imports: [Vflow] }, add: { imports: [VflowMocks] } });
  const fixture = TestBed.createComponent(FlowHostComponent);
  fixture.detectChanges();

  return { fixture, flow: fixture.componentInstance.vflow() as unknown as VflowMockComponent };
}

describe('VflowMocks', () => {
  it('render the presentations of a template written for Vflow', () => {
    const { fixture } = renderWithMocks();
    const root = fixture.nativeElement as HTMLElement;

    expect(Array.from(root.querySelectorAll('.node'), (node) => node.textContent!.trim().split(/\s+/)[0])).toEqual([
      'parent',
      'child',
      'auto',
    ]);
    expect(root.querySelector('.node [vHandle]')!.textContent!.trim()).toBe('idle');
    expect(root.querySelector('.edge-label')!.textContent).toBe('parent-auto');
    expect(root.querySelectorAll('v-node-toolbar button').length).toBe(3);
  });

  it('applies viewport changes at once within the zoom limits', async () => {
    const { flow } = renderWithMocks();

    expect(await flow.setViewport({ x: 10, y: 20, zoom: 5 })).toBe(true);
    expect(flow.viewport()).toEqual({ x: 10, y: 20, zoom: 2 });

    await flow.zoomTo(1);
    await flow.zoomIn();
    expect(flow.viewport().zoom).toBeCloseTo(1.2);
    await flow.zoomOut();
    await flow.zoomOut();
    expect(flow.viewport().zoom).toBeCloseTo(1 / 1.2);

    await flow.setCenter({ x: 100, y: 50 }, { zoom: 0.1 });
    expect(flow.viewport()).toEqual({ x: -50, y: -25, zoom: 0.5 });
  });

  it('answers node queries from the nodes it was given', () => {
    const { fixture, flow } = renderWithMocks();
    const [parent, child] = fixture.componentInstance.nodes;

    expect(flow.getNode('child')).toBe(child);
    expect(flow.getNode('missing')).toBeUndefined();
    expect(flow.getNodeRect('parent')).toEqual({ x: 10, y: 20, width: 200, height: 100 });
    // A child rectangle is in flow coordinates, and a node without a size has no rectangle.
    expect(flow.getNodeRect('child')).toEqual({ x: 15, y: 25, width: 50, height: 40 });
    expect(flow.getNodeRect('auto')).toBeUndefined();
    expect(flow.getNodesBounds()).toEqual(flow.getNodeRect(parent.id));
    expect(flow.getNodesBounds(['auto'])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(flow.getNodesAtPoint({ x: 20, y: 30 })).toEqual([]);
    expect(flow.getIntersectingNodes('child')).toEqual([]);
    expect(flow.getDetachedEdges()).toEqual([]);
    expect(flow.clientToFlowPosition({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
    expect(flow.initialized()).toBe(true);
  });
});

describe('VflowMocks parity', () => {
  // Decorated classes lose their names in the test build, so every pair carries its own.
  const pairs: Array<[name: string, real: Type<unknown>, mock: Type<unknown>]> = [
    ['VflowComponent', VflowComponent, VflowMockComponent],
    ['VflowHandleDirective', VflowHandleDirective, VflowHandleMockDirective],
    ['VflowResizableComponent', VflowResizableComponent, VflowResizableMockComponent],
    ['VflowSelectableDirective', VflowSelectableDirective, VflowSelectableMockDirective],
    ['VflowEdgeInteractionDirective', VflowEdgeInteractionDirective, VflowEdgeInteractionMockDirective],
    ['VflowMinimapComponent', VflowMinimapComponent, VflowMinimapMockComponent],
    ['VflowNodeToolbarComponent', VflowNodeToolbarComponent, VflowNodeToolbarMockComponent],
    ['VflowDragHandleDirective', VflowDragHandleDirective, VflowDragHandleMockDirective],
    ['VflowNodeTemplateDirective', VflowNodeTemplateDirective, VflowNodeTemplateMockDirective],
    ['VflowEdgeLabelTemplateDirective', VflowEdgeLabelTemplateDirective, VflowEdgeLabelTemplateMockDirective],
    ['VflowEdgeTemplateDirective', VflowEdgeTemplateDirective, VflowEdgeTemplateMockDirective],
    ['VflowConnectionTemplateDirective', VflowConnectionTemplateDirective, VflowConnectionTemplateMockDirective],
    ['VflowMarkerTemplateDirective', VflowMarkerTemplateDirective, VflowMarkerTemplateMockDirective],
  ];

  /** The selector, inputs and outputs a template sees; host directive outputs are not part of it. */
  function templateApi(type: Type<unknown>) {
    const def = (type as any).ɵcmp ?? (type as any).ɵdir;

    return {
      selectors: def.selectors,
      exportAs: def.exportAs,
      inputs: Object.keys(def.inputs).sort(),
      outputs: Object.keys(def.outputs).sort(),
    };
  }

  it.each(pairs)('the mock of %s has its selector and inputs, and at least its outputs', (_, real, mock) => {
    const { outputs, ...api } = templateApi(real);
    const { outputs: mockOutputs, ...mockApi } = templateApi(mock);

    expect(mockApi).toEqual(api);
    // The mock declares the outputs of the host directives of the real component as its own.
    expect(mockOutputs).toEqual(expect.arrayContaining(outputs));
  });

  it('the mock of VflowComponent takes the parameters of every public method', () => {
    type Methods<T> = {
      -readonly [K in keyof T as T[K] extends (...args: any[]) => unknown ? K : never]: T[K] extends (
        ...args: infer P
      ) => unknown
        ? P
        : never;
    };

    expectTypeOf<Methods<VflowMockComponent>>().toEqualTypeOf<Methods<VflowComponent>>();
  });

  it('every directive of Vflow has a mock', () => {
    const mocked = new Set(pairs.map(([, real]) => real));
    const unmocked = Vflow.filter((type) => !mocked.has(type)).map((type) => templateApi(type).selectors);

    // The gesture exclusions have no mocks yet.
    expect(unmocked).toEqual([
      [['', 'vNoKeyboard', '']],
      [['', 'vNoDrag', '']],
      [['', 'vNoPan', '']],
      [['', 'vNoWheel', '']],
    ]);
    expect(VflowMocks.length).toBe(pairs.length);
  });
});
