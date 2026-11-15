import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DemoIconComponent, DemoIconName, DocsBadgeTone, DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

/** What a step is, shown by the color of its icon: where the process starts, a decision of a person, an action. */
type StepKind = 'trigger' | 'review' | 'action';

interface StepData {
  title: string;
  kind: StepKind;
  icon: DemoIconName;
  description: string;
}

/** Where an edge stands in the process: done, still open, or a branch the decision ruled out. */
type EdgeState = 'taken' | 'open' | 'skipped';

/** The kind of a step is the color of its icon tile, the application's own: the parts ship no palette. */
const KIND_COLOR: Record<StepKind, string> = {
  trigger: '[--icon-color:var(--color-cyan-600)]',
  review: '[--icon-color:var(--color-violet-500)]',
  action: '[--icon-color:var(--color-teal-600)]',
};

@Component({
  selector: 'app-ui-workflow-demo',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-demo framed role="region" aria-label="Approval workflow demo">
      <!-- The process runs from the top down, so the scene is about as wide as the docs column and fits it at nearly
           its real size. It fits by its width, which leaves a band above and below the cards for the viewport
           controls. -->
      <div class="h-185">
        <vflow
          [nodes]="nodes"
          [edges]="edges"
          [background]="background"
          [minZoom]="0.5"
          [maxZoom]="2"
          (initialized)="flow().fitView({ maxZoom: 1 })">
          <article *vNode="let ctx of nodes" vuiNode class="w-[230px] text-[14px]" [attr.data-step]="ctx.node.id">
            <header vuiNodeHeader>
              <span docsNodeIcon tile [class]="kindColor[ctx.data().kind]">
                <app-demo-icon [name]="ctx.data().icon" />
              </span>
              <span vuiTitle>{{ ctx.data().title }}</span>
            </header>
            <div class="p-vui-3">
              <p class="m-0 min-h-[2lh] text-vui-muted">{{ ctx.data().description }}</p>
            </div>
            <!-- As tall as a footer with a button, so every card has the same height and straight edges stay
                 straight. -->
            <footer vuiNodeFooter class="min-h-[calc(28px+var(--vui-space)*6+1px)]">
              @let status = statusOf(ctx.node.id);
              <span data-testid="status" [docsBadge]="status.tone">{{ status.text }}</span>
              @if (ctx.node.id === 'review') {
                <button
                  docsButton="primary"
                  class="ms-auto"
                  vNoDrag
                  type="button"
                  [disabled]="approved()"
                  (click)="approved.set(true)">
                  Approve
                </button>
              }
            </footer>
            <!-- Display only: plain core handles anchor the edges, with no port drawn under the arrowheads. -->
            @if (ctx.node.id !== 'received') {
              <span vHandle handleType="target" position="top" [canStart]="false" [canAccept]="false"></span>
            }
            @if (ctx.node.id === 'received') {
              <span vHandle handleType="source" position="bottom" [canStart]="false" [canAccept]="false"></span>
            }
            @if (ctx.node.id === 'review') {
              <!-- One exit per branch, one on each side: a branch starts apart and its condition sits at its start. -->
              <span
                vHandle
                handleType="source"
                position="left"
                handleId="approved"
                [canStart]="false"
                [canAccept]="false"></span>
              <span
                vHandle
                handleType="source"
                position="right"
                handleId="changes"
                [canStart]="false"
                [canAccept]="false"></span>
            }
            @if (ctx.selected()) {
              <v-node-toolbar>
                <div vuiToolbar>
                  <button
                    docsButton="plain"
                    small
                    vNoDrag
                    type="button"
                    [attr.aria-label]="'Zoom to ' + ctx.data().title"
                    (click)="flow().fitView({ nodes: [ctx.node.id], padding: 0.5 })">
                    Zoom to node
                  </button>
                </div>
              </v-node-toolbar>
            }
          </article>
          <ng-template let-ctx vEdge>
            @let state = edgeState(ctx.edge.id);
            <svg:g vEdgeInteractionArea>
              <!-- The process state is the application's own, drawn by utilities keyed on its attribute; a selected
                   edge keeps the library color. -->
              <svg:path
                vuiEdge
                class="data-[state=taken]:not-[[data-v-selected]_*]:stroke-vui-success data-[state=skipped]:not-[[data-v-selected]_*]:opacity-45 data-[state=skipped]:not-[[data-v-selected]_*]:[stroke-dasharray:4_4]"
                [attr.d]="ctx.path()"
                [attr.marker-end]="ctx.markerEnd()"
                [attr.data-state]="state" />
            </svg:g>
            <!-- On a ruled-out branch only the text fades: the label keeps its opaque surface over the dashed line. -->
            @if (ctx.data()?.start; as text) {
              <span
                *vEdgeLabel="'start'"
                vuiEdgeLabel
                class="data-[state=skipped]:text-vui-muted"
                [attr.data-label]="text"
                [attr.data-state]="state"
                >{{ text }}</span
              >
            }
            @if (ctx.data()?.center; as text) {
              <span
                *vEdgeLabel
                vuiEdgeLabel
                class="data-[state=skipped]:text-vui-muted"
                [attr.data-label]="text"
                [attr.data-state]="state"
                >{{ text }}</span
              >
            }
            @if (ctx.data()?.end; as text) {
              <span *vEdgeLabel="'end'" vuiEdgeLabel vuiMeta [attr.data-label]="text" [attr.data-state]="state">{{
                text
              }}</span>
            }
          </ng-template>
        </vflow>
      </div>
      <vui-controls class="absolute bottom-2.5 left-2.5 z-2" [flow]="flow()" />
    </docs-demo>
  `,
})
export class WorkflowDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);
  protected readonly approved = signal(false);
  protected readonly background = SCENE_BACKGROUND;
  protected readonly kindColor = KIND_COLOR;
  protected readonly nodes = createNodes<StepData>([
    step('received', { x: 265, y: 0 }, 'trigger', 'Invoice received', 'arrow-down', 'A new invoice from the supplier.'),
    step('review', { x: 265, y: 236 }, 'review', 'Finance review', 'search', 'Check the amount and approve payment.'),
    step(
      'paid',
      { x: 0, y: 472 },
      'action',
      'Schedule payment',
      'arrow-right',
      'Send the approved invoice to accounting.',
    ),
    step(
      'fix',
      { x: 530, y: 472 },
      'action',
      'Request correction',
      'alert',
      'The supplier must provide a purchase order.',
    ),
  ]);
  protected readonly edges = createEdges([
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
      data: { start: 'Rejected' },
    },
  ]);

  /** Application statuses follow the decision; the library only draws them. */
  protected statusOf(id: string): { tone: DocsBadgeTone; text: string } {
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

  protected edgeState(id: string): EdgeState {
    if (id === 'received-review') return 'taken';
    if (!this.approved()) return 'open';
    return id === 'review-paid' ? 'taken' : 'skipped';
  }
}

function step(
  id: string,
  point: { x: number; y: number },
  kind: StepKind,
  title: string,
  icon: DemoIconName,
  description: string,
) {
  return { id, point, ariaLabel: title, data: { title, kind, icon, description } };
}
