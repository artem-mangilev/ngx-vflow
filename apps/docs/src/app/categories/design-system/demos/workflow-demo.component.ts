import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-workflow-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./demo.css'],
  styles: `
    article {
      width: 210px;
    }
    .description {
      min-height: 58px;
    }
    .controls {
      --vui-accent: #0f766e;
      --vui-on-accent: white;
    }
  `,
  template: `
    <section class="demo" aria-label="Approval workflow demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        @if (flow(); as editor) {
          <vflow-controls [flow]="editor" />
        }
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <label><input type="checkbox" [checked]="readOnly()" (change)="toggleReadOnly()" /> Read only</label>
        <p>Approve the invoice; select a node to inspect it.</p>
      </div>
      <vflow view="auto" [minZoom]="0.5" [maxZoom]="1.5" [nodes]="nodes" [edges]="edges">
        <mini-map />
        <ng-template let-ctx nodeHtml>
          <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
            <header vflowNodeHeader>
              <span aria-hidden="true">{{ ctx.data().icon }}</span>
              <span class="grow">{{ ctx.data().title }}</span>
            </header>
            <div vflowNodeBody class="description">{{ ctx.data().description }}</div>
            <footer vflowNodeFooter>
              @if (ctx.node.id === 'review') {
                <span vflowStatus="danger" title="Diagnostic: purchase order missing">Missing PO</span>
                <span [vflowStatus]="approved() ? 'success' : 'warning'" [vflowStatusActive]="!approved()">{{
                  approved() ? 'Approved' : 'Waiting'
                }}</span>
                <button
                  vflowButton
                  vflowNoDrag
                  type="button"
                  [disabled]="readOnly() || approved()"
                  (click)="approved.set(true)">
                  Approve
                </button>
              } @else {
                <span [vflowStatus]="ctx.data().tone">{{ ctx.data().status }}</span>
              }
            </footer>
            @if (ctx.node.id !== 'received') {
              <handle type="target" position="left" [canStart]="false" [canAccept]="false" [template]="port" />
            }
            @if (ctx.node.id !== 'paid' && ctx.node.id !== 'fix') {
              @if (ctx.node.id === 'review') {
                <handle
                  id="approved"
                  type="source"
                  position="right"
                  [offsetY]="-30"
                  [canStart]="false"
                  [canAccept]="false"
                  [template]="port" />
                <handle
                  id="changes"
                  type="source"
                  position="right"
                  [offsetY]="30"
                  [canStart]="false"
                  [canAccept]="false"
                  [template]="port" />
              } @else {
                <handle type="source" position="right" [canStart]="false" [canAccept]="false" [template]="port" />
              }
            }
            @if (ctx.selected()) {
              <node-toolbar>
                <span vflowToolbar>{{ ctx.data().title }} · {{ readOnly() ? 'View only' : 'Drag to move' }}</span>
              </node-toolbar>
            }
          </article>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path
              vflowEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
        <ng-template let-ctx edgeLabelHtml>
          <span vflowEdgeLabel>{{ ctx.label.data }}</span>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle>
        <span vflowPort [vflowPortState]="ctx.state()"></span>
      </ng-template>
    </section>
  `,
})
export class WorkflowDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly readOnly = signal(false);
  readonly approved = signal(false);
  readonly nodes = createNodes([
    {
      id: 'received',
      type: 'html-template',
      point: { x: 20, y: 110 },
      ariaLabel: 'Invoice received',
      data: {
        title: 'Invoice received',
        icon: '↓',
        description: 'A new invoice from the supplier.',
        tone: 'success',
        status: 'Complete',
      },
    },
    {
      id: 'review',
      type: 'html-template',
      point: { x: 310, y: 110 },
      ariaLabel: 'Finance review',
      data: {
        title: 'Finance review',
        icon: '✓',
        description: 'Check the amount and approve payment.',
        tone: 'warning',
        status: 'Waiting',
      },
    },
    {
      id: 'paid',
      type: 'html-template',
      point: { x: 610, y: 10 },
      ariaLabel: 'Schedule payment',
      data: {
        title: 'Schedule payment',
        icon: '→',
        description: 'Send the approved invoice to accounting.',
        tone: 'neutral',
        status: 'Next step',
      },
    },
    {
      id: 'fix',
      type: 'html-template',
      point: { x: 610, y: 250 },
      ariaLabel: 'Request correction',
      data: {
        title: 'Request correction',
        icon: '!',
        description: 'The supplier must provide a purchase order.',
        tone: 'danger',
        status: 'Missing PO',
      },
    },
  ]);
  readonly edges = createEdges([
    {
      id: 'received-review',
      source: 'received',
      target: 'review',
      type: 'template',
      curve: 'smooth-step',
      markers: { end: {} },
    },
    {
      id: 'review-paid',
      sourceHandle: 'approved',
      source: 'review',
      target: 'paid',
      type: 'template',
      curve: 'smooth-step',
      markers: { end: {} },
      edgeLabels: {
        start: { type: 'html-template', data: 'Yes' },
        center: { type: 'html-template', data: 'Approved' },
        end: { type: 'html-template', data: 'Queue' },
      },
    },
    {
      id: 'review-fix',
      sourceHandle: 'changes',
      source: 'review',
      target: 'fix',
      type: 'template',
      curve: 'smooth-step',
      markers: { end: {} },
      edgeLabels: { center: { type: 'html-template', data: 'Needs changes' } },
    },
  ]);

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }

  toggleReadOnly() {
    this.readOnly.update((value) => !value);
    this.nodes.forEach((node) => node.draggable.set(!this.readOnly()));
  }
}
