import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowTone, VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

interface StepData {
  title: string;
  icon: string;
  description: string;
  /** Application status: a word of this application, not a library lifecycle. */
  status: { tone: VflowTone; text: string; busy?: boolean };
  /** Model diagnostic; shown next to status and independent from selection. */
  diagnostic?: { tone: 'info' | 'warning' | 'danger'; text: string };
}

@Component({
  selector: 'app-ui-workflow-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    article {
      width: 230px;
    }
    .description {
      min-height: 58px;
    }
    .controls {
      --vui-accent: #0f766e;
      --vui-on-accent: white;
    }
    .footnote {
      margin: 0;
      min-height: 20px;
      padding: 8px 14px;
      font-size: 13px;
      color: var(--vui-muted);
    }
  `,
  template: `
    <section class="demo" aria-label="Approval workflow demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit workflow</button>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <label><input type="checkbox" [checked]="readOnly()" (change)="toggleReadOnly()" /> Read only</label>
        <p>Approve the invoice; select a node to inspect it.</p>
      </div>
      <vflow view="auto" background="var(--vui-canvas)" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx nodeHtml>
          <article vflowNode selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
            <header vflowNodeHeader>
              <span vflowNodeIcon aria-hidden="true">{{ ctx.data().icon }}</span>
              <span vflowNodeTitle>{{ ctx.data().title }}</span>
            </header>
            <div vflowNodeBody>
              <p vflowNodeDescription class="description">{{ ctx.data().description }}</p>
            </div>
            <footer vflowNodeFooter>
              @if (ctx.node.id === 'review') {
                <span [vflowStatus]="approved() ? 'success' : 'warning'">{{
                  approved() ? 'Approved' : 'Waiting'
                }}</span>
              } @else {
                <span [vflowStatus]="ctx.data().status.tone" [vflowStatusBusy]="ctx.data().status.busy ?? false">{{
                  ctx.data().status.text
                }}</span>
              }
              @if (ctx.data().diagnostic; as diagnostic) {
                <span [vflowDiagnostic]="diagnostic.tone">{{ diagnostic.text }}</span>
              }
              <span vflowNodeActions>
                @if (ctx.node.id === 'review') {
                  <button
                    vflowButton
                    vflowNoDrag
                    type="button"
                    [disabled]="readOnly() || approved()"
                    (click)="approved.set(true)">
                    Approve
                  </button>
                } @else {
                  <button
                    vflowButton
                    vflowNoDrag
                    type="button"
                    [disabled]="readOnly()"
                    [attr.aria-label]="'Open ' + ctx.data().title"
                    (click)="opened.set(ctx.data().title)">
                    Open
                  </button>
                }
              </span>
            </footer>
            @if (ctx.node.id !== 'received') {
              <handle type="target" position="left" [canStart]="false" [canAccept]="false" [template]="port" />
            }
            @if (ctx.node.id !== 'paid' && ctx.node.id !== 'fix') {
              <handle type="source" position="right" [canStart]="false" [canAccept]="false" [template]="port" />
            }
            @if (ctx.selected()) {
              <node-toolbar>
                <div vflowToolbar>
                  <span>{{ readOnly() ? 'View only' : 'Drag to move' }}</span>
                  <button
                    vflowButton
                    vflowNoDrag
                    type="button"
                    [attr.aria-label]="'Details of ' + ctx.data().title"
                    (click)="opened.set(ctx.data().title)">
                    Details
                  </button>
                </div>
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
        <span vflowPort vflowPortConnected [vflowPortState]="ctx.state()"></span>
      </ng-template>
      <p class="footnote" aria-live="polite" data-testid="opened">{{ opened() ? 'Opened: ' + opened() : '' }}</p>
    </section>
  `,
})
export class WorkflowDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly readOnly = signal(false);
  readonly approved = signal(false);
  readonly opened = signal('');
  readonly nodes = createNodes<StepData>([
    {
      id: 'received',
      type: 'html-template',
      point: { x: 20, y: 110 },
      ariaLabel: 'Invoice received',
      data: {
        title: 'Invoice received',
        icon: '↓',
        description: 'A new invoice from the supplier.',
        status: { tone: 'success', text: 'Complete' },
      },
    },
    {
      id: 'review',
      type: 'html-template',
      point: { x: 330, y: 110 },
      ariaLabel: 'Finance review',
      data: {
        title: 'Finance review',
        icon: '✓',
        description: 'Check the amount and approve payment.',
        status: { tone: 'warning', text: 'Waiting' },
        diagnostic: { tone: 'warning', text: 'Above limit' },
      },
    },
    {
      id: 'paid',
      type: 'html-template',
      point: { x: 650, y: 10 },
      ariaLabel: 'Schedule payment',
      data: {
        title: 'Schedule payment',
        icon: '→',
        description: 'Send the approved invoice to accounting.',
        status: { tone: 'info', text: 'Scheduling', busy: true },
      },
    },
    {
      id: 'fix',
      type: 'html-template',
      point: { x: 650, y: 250 },
      ariaLabel: 'Request correction',
      data: {
        title: 'Request correction',
        icon: '!',
        description: 'The supplier must provide a purchase order.',
        status: { tone: 'neutral', text: 'Waiting for supplier' },
        diagnostic: { tone: 'danger', text: 'Missing PO' },
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
      markers: { end: { color: 'var(--vui-muted)' } },
    },
    {
      id: 'review-paid',
      source: 'review',
      target: 'paid',
      type: 'template',
      curve: 'smooth-step',
      markers: { end: { color: 'var(--vui-muted)' } },
      edgeLabels: { center: { type: 'html-template', data: 'Approved' } },
    },
    {
      id: 'review-fix',
      source: 'review',
      target: 'fix',
      type: 'template',
      curve: 'smooth-step',
      markers: { end: { color: 'var(--vui-muted)' } },
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
