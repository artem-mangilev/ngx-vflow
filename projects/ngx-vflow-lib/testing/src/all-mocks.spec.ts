import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../../src/public-api';
import { Vflow } from '../../src/public-api';
import { Node } from '../../src/public-api';
import { Edge } from '../../src/public-api';
import { ConnectionSettings } from '../../src/public-api';
import { createNodes, createEdges } from '../../src/public-api';
import { VflowMocks } from './vflow-mocks';

@Component({
  template: `
    <vflow
      #vflow
      [nodes]="nodes"
      [edges]="edges"
      [view]="'auto'"
      [minZoom]="0"
      [maxZoom]="0"
      [background]="'#fff'"
      [optimization]="{ detachedGroupsLayer: true }"
      [entitiesSelectable]="true"
      [keyboardShortcuts]="{ multiSelection: null }"
      [connection]="connection"
      [snapGrid]="[1, 1]"
      [elevateNodesOnSelect]="true"
      (componentNodeEvent)="(null)"
      (connect)="(null)">
      <ng-template nodeHtml>
        <div dragHandle selectable resizable [resizerColor]="'#2e414c'" [gap]="1.5">
          <handle [position]="'left'" [type]="'source'" [id]="'1'" [template]="handleTemplate" />

          <ng-template #handleTemplate>
            <div>Handle Template</div>
          </ng-template>

          <node-toolbar position="left">
            <button>Delete</button>
          </node-toolbar>
        </div>
      </ng-template>

      <ng-template let-ctx groupNode>
        <svg:rect
          selectable
          rx="5"
          ry="5"
          [attr.width]="ctx.width()"
          [attr.height]="ctx.height()"
          [style.stroke]="'red'"
          [style.fill]="'red'"
          [style.fill-opacity]="0.05"
          [style.stroke-width]="ctx.selected() ? 3 : 1">
          <handle type="source" position="right" />
        </svg:rect>
      </ng-template>

      <ng-template let-ctx edge>
        <svg:path fill="none" [attr.d]="ctx.path()" [attr.stroke-width]="4" [attr.marker-end]="ctx.markerEnd()" />
      </ng-template>

      <ng-template let-ctx edgeLabelHtml>
        <div>{{ ctx.edge.id }}</div>
      </ng-template>

      <ng-template let-ctx connection>
        <svg:path fill="none" [attr.d]="ctx.path()" [attr.stroke]="ctx.marker()" />
      </ng-template>

      <mini-map
        [maskColor]="'rgba(215, 215, 215, 0.6)'"
        [strokeColor]="'rgb(200, 200, 200)'"
        [position]="'bottom-right'"
        [scaleOnHover]="true" />
    </vflow>
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class VflowWrapperComponent {
  public vflow = viewChild<VflowComponent>('vflow');

  public nodes: Node[] = createNodes([
    {
      type: 'html-template',
      id: '1',
      point: { x: 0, y: 0 },
    },
    {
      type: 'template-group',
      id: '2',
      point: { x: 0, y: 0 },
      width: 100,
      height: 100,
    },
  ]);

  public edges: Edge[] = createEdges([
    {
      id: '1',
      source: '1',
      target: '2',
      type: 'template',
      edgeLabels: {
        start: {
          type: 'html-template',
        },
      },
    },
  ]);

  public connection: ConnectionSettings = {
    type: 'template',
  };

  callViewChildApis() {
    try {
      this.vflow()!.viewport();

      this.vflow()!.nodesChange();

      this.vflow()!.edgesChange();

      this.vflow()!.viewportChange$.subscribe();

      this.vflow()!.nodesChange$.subscribe();

      this.vflow()!.edgesChange$.subscribe();

      this.vflow()!.viewportTo({
        x: 0,
        y: 0,
        zoom: 1,
      });

      this.vflow()!.zoomTo(1);

      this.vflow()!.panTo({
        x: 0,
        y: 0,
      });

      this.vflow()!.fitView();

      this.vflow()!.documentPointToFlowPoint({
        x: 0,
        y: 0,
      });

      this.vflow()!.getNode('1');

      this.vflow()!.getDetachedEdges();

      return true;
    } catch {
      return false;
    }
  }
}

describe('VflowMockComponent', () => {
  let fixture: ComponentFixture<VflowWrapperComponent>;
  let component: VflowWrapperComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VflowWrapperComponent],
    })
      .overrideComponent(VflowWrapperComponent, {
        remove: {
          imports: [Vflow],
        },
        add: {
          imports: [VflowMocks],
        },
      })
      .compileComponents();
    fixture = TestBed.createComponent(VflowWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should successfully create mock vflow component and run all view child apis', () => {
    expect(component).toBeTruthy();
    expect(component.callViewChildApis()).toBeTrue();
  });
});
