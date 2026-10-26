import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';
import { DemoIconComponent, DemoIconName } from '../../../shared/demo-icon.component';
import { injectDocsTheme } from '../../../shared/docs-theme';

/** Tones of the application's own badge; the vflow UI parts ship none. */
type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StepData {
  title: string;
  icon: DemoIconName;
  description: string;
}

/** Where an edge stands in the process: done, still open, or a branch the decision ruled out. */
type EdgeState = 'taken' | 'open' | 'skipped';

@Component({
  selector: 'app-ui-workflow-demo',
  imports: [Vflow, Vui, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    article {
      width: 230px;
      font-size: 14px;
    }
    .description {
      margin: 0;
      min-height: 2lh;
      color: var(--vui-muted);
    }
    /* As tall as a footer with a button, so every card has the same height and straight edges stay straight. */
    footer {
      min-height: calc(28px + 6 * var(--vui-space) + 1px);
    }
    /* The process state is application CSS on the public selectors; selection keeps the library color. */
    .vui-edge[data-state='taken']:not([data-vui-selected='true']) {
      stroke: var(--vui-success);
    }
    .vui-edge[data-state='skipped']:not([data-vui-selected='true']) {
      stroke-dasharray: 4 4;
      opacity: 0.45;
    }
    /* Only the text fades: the label keeps its opaque surface over the dashed line. */
    .vui-edge-label[data-state='skipped'] {
      color: var(--vui-muted);
    }
  `,
  template: `
    <section class="demo" aria-label="Approval workflow demo" [attr.data-vui-theme]="theme()">
      <div class="stage">
        <vflow
          view="auto"
          [nodes]="nodes"
          [edges]="edges"
          [minZoom]="0.5"
          [maxZoom]="2"
          (initialized)="flow()?.fitView()">
          <ng-template let-ctx vNode>
            <article vuiNode [selected]="ctx.selected() || ctx.preselected()" [attr.data-step]="ctx.node.id">
              <header vuiNodeHeader>
                <span vuiIcon><app-demo-icon [name]="ctx.data().icon" /></span>
                <span vuiTitle>{{ ctx.data().title }}</span>
              </header>
              <div vuiNodeBody>
                <p class="description">{{ ctx.data().description }}</p>
              </div>
              <footer vuiNodeFooter>
                @let status = statusOf(ctx.node.id);
                <span class="badge" [attr.data-tone]="status.tone">{{ status.text }}</span>
                @if (ctx.node.id === 'review') {
                  <span vuiActions>
                    <button
                      class="button primary"
                      vNoDrag
                      type="button"
                      [disabled]="approved()"
                      (click)="approved.set(true)">
                      Approve
                    </button>
                  </span>
                }
              </footer>
              <!-- Display only: plain core handles anchor the edges, with no port drawn under the arrowheads. -->
              @if (ctx.node.id !== 'received') {
                <span vHandle handleType="target" position="left" [canStart]="false" [canAccept]="false"></span>
              }
              @if (ctx.node.id === 'received') {
                <span vHandle handleType="source" position="right" [canStart]="false" [canAccept]="false"></span>
              }
              @if (ctx.node.id === 'review') {
                <!-- One exit per branch, so each branch starts apart and its condition sits at its start. -->
                <span
                  vHandle
                  handleType="source"
                  position="right"
                  handleId="approved"
                  [canStart]="false"
                  [canAccept]="false"></span>
                <span
                  vHandle
                  handleType="source"
                  position="bottom"
                  handleId="changes"
                  [canStart]="false"
                  [canAccept]="false"></span>
              }
              @if (ctx.selected()) {
                <v-node-toolbar>
                  <div vuiToolbar>
                    <button
                      class="button plain small"
                      vNoDrag
                      type="button"
                      [attr.aria-label]="'Zoom to ' + ctx.data().title"
                      (click)="flow()?.fitView({ nodes: [ctx.node.id], padding: 0.5 })">
                      Zoom to node
                    </button>
                  </div>
                </v-node-toolbar>
              }
            </article>
          </ng-template>
          <ng-template let-ctx vEdge>
            @let state = edgeState(ctx.edge.id);
            <svg:g vEdgeInteraction>
              <svg:path
                vuiEdge
                [attr.d]="ctx.path()"
                [attr.marker-end]="ctx.markerEnd()"
                [attr.data-state]="state"
                [selected]="ctx.selected() || ctx.preselected()" />
            </svg:g>
            @if (ctx.data()?.start; as text) {
              <span *vEdgeLabel="'start'" vuiEdgeLabel [attr.data-label]="text" [attr.data-state]="state">{{
                text
              }}</span>
            }
            @if (ctx.data()?.center; as text) {
              <span *vEdgeLabel vuiEdgeLabel [attr.data-label]="text" [attr.data-state]="state">{{ text }}</span>
            }
            @if (ctx.data()?.end; as text) {
              <span *vEdgeLabel="'end'" vuiEdgeLabel vuiMeta [attr.data-label]="text" [attr.data-state]="state">{{
                text
              }}</span>
            }
          </ng-template>
        </vflow>
        @if (flow(); as flow) {
          <vui-controls class="stage-controls" [flow]="flow" />
        }
      </div>
    </section>
  `,
})
export class WorkflowDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly theme = injectDocsTheme();
  readonly approved = signal(false);
  readonly nodes = createNodes<StepData>([
    step('received', { x: 0, y: 150 }, 'Invoice received', 'arrow-down', 'A new invoice from the supplier.'),
    step('review', { x: 400, y: 150 }, 'Finance review', 'search', 'Check the amount and approve payment.'),
    step('paid', { x: 840, y: 0 }, 'Schedule payment', 'arrow-right', 'Send the approved invoice to accounting.'),
    step('fix', { x: 840, y: 340 }, 'Request correction', 'alert', 'The supplier must provide a purchase order.'),
  ]);
  readonly edges = createEdges([
    {
      id: 'received-review',
      source: 'received',
      target: 'review',
      curve: 'smooth-step',
      markers: { end: {} },
      // Labels at the start, center and end of an edge follow its geometry.
      data: { center: '€12,400' },
    },
    {
      id: 'review-paid',
      source: 'review',
      sourceHandle: 'approved',
      target: 'paid',
      curve: 'smooth-step',
      markers: { end: {} },
      data: { start: 'Approved', end: 'within 1 day' },
    },
    {
      id: 'review-fix',
      source: 'review',
      sourceHandle: 'changes',
      target: 'fix',
      curve: 'smooth-step',
      markers: { end: {} },
      data: { start: 'Needs changes' },
    },
  ]);

  /** Application statuses follow the decision; the library only draws them. */
  statusOf(id: string): { tone: Tone; text: string } {
    const approved = this.approved();
    switch (id) {
      case 'received':
        return { tone: 'success', text: 'Complete' };
      case 'review':
        return approved ? { tone: 'success', text: 'Approved' } : { tone: 'warning', text: 'Waiting' };
      case 'paid':
        return approved ? { tone: 'info', text: 'Scheduled' } : { tone: 'neutral', text: 'Pending' };
      default:
        return approved ? { tone: 'neutral', text: 'Not needed' } : { tone: 'danger', text: 'Missing PO' };
    }
  }

  edgeState(id: string): EdgeState {
    if (id === 'received-review') return 'taken';
    if (!this.approved()) return 'open';
    return id === 'review-paid' ? 'taken' : 'skipped';
  }
}

function step(id: string, point: { x: number; y: number }, title: string, icon: DemoIconName, description: string) {
  return { id, point, ariaLabel: title, data: { title, icon, description } };
}
