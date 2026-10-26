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
  /** Application status: a word of this application, not a library lifecycle. */
  status: { tone: Tone; text: string };
}

@Component({
  selector: 'app-ui-workflow-demo',
  imports: [Vflow, Vui, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    article {
      width: 230px;
    }
    .description {
      margin: 0;
      min-height: 58px;
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
            <article vuiNode [selected]="ctx.selected() || ctx.preselected()">
              <header vuiNodeHeader>
                <span vuiIcon><app-demo-icon [name]="ctx.data().icon" /></span>
                <span vuiTitle>{{ ctx.data().title }}</span>
              </header>
              <div vuiNodeBody>
                <p class="description">{{ ctx.data().description }}</p>
              </div>
              <footer vuiNodeFooter>
                @if (ctx.node.id === 'review') {
                  <span class="badge" [attr.data-tone]="approved() ? 'success' : 'warning'">{{
                    approved() ? 'Approved' : 'Waiting'
                  }}</span>
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
                } @else {
                  <span class="badge" [attr.data-tone]="ctx.data().status.tone">{{ ctx.data().status.text }}</span>
                }
              </footer>
              @if (ctx.node.id !== 'received') {
                <span
                  vuiPort
                  handleType="target"
                  position="left"
                  vuiPortConnected
                  [canStart]="false"
                  [canAccept]="false"></span>
              }
              @if (ctx.node.id !== 'paid' && ctx.node.id !== 'fix') {
                <span
                  vuiPort
                  handleType="source"
                  position="right"
                  vuiPortConnected
                  [canStart]="false"
                  [canAccept]="false"></span>
              }
              @if (ctx.selected()) {
                <v-node-toolbar>
                  <div vuiToolbar>
                    <span>Drag to move</span>
                    <button
                      class="button plain small"
                      vNoDrag
                      type="button"
                      [attr.aria-label]="'Zoom to ' + ctx.data().title"
                      (click)="flow()?.fitView({ nodes: [ctx.node.id], padding: 0.5 })">
                      Zoom to
                    </button>
                  </div>
                </v-node-toolbar>
              }
            </article>
          </ng-template>
          <ng-template let-ctx vEdge>
            <svg:g vEdgeInteraction>
              <svg:path
                vuiEdge
                [attr.d]="ctx.path()"
                [attr.marker-end]="ctx.markerEnd()"
                [selected]="ctx.selected() || ctx.preselected()" />
            </svg:g>
            @if (ctx.data()?.start; as text) {
              <span *vEdgeLabel="'start'" vuiEdgeLabel vuiMeta [attr.data-label]="text">{{ text }}</span>
            }
            @if (ctx.data()?.center; as text) {
              <span *vEdgeLabel vuiEdgeLabel [attr.data-label]="text">{{ text }}</span>
            }
            @if (ctx.data()?.end; as text) {
              <span *vEdgeLabel="'end'" vuiEdgeLabel vuiMeta [attr.data-label]="text">{{ text }}</span>
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
    {
      id: 'received',
      point: { x: 0, y: 150 },
      ariaLabel: 'Invoice received',
      data: {
        title: 'Invoice received',
        icon: 'arrow-down',
        description: 'A new invoice from the supplier.',
        status: { tone: 'success', text: 'Complete' },
      },
    },
    {
      id: 'review',
      point: { x: 400, y: 150 },
      ariaLabel: 'Finance review',
      data: {
        title: 'Finance review',
        icon: 'check',
        description: 'Check the amount and approve payment.',
        status: { tone: 'warning', text: 'Waiting' },
      },
    },
    {
      id: 'paid',
      point: { x: 840, y: 0 },
      ariaLabel: 'Schedule payment',
      data: {
        title: 'Schedule payment',
        icon: 'arrow-right',
        description: 'Send the approved invoice to accounting.',
        status: { tone: 'info', text: 'Scheduling' },
      },
    },
    {
      id: 'fix',
      point: { x: 840, y: 320 },
      ariaLabel: 'Request correction',
      data: {
        title: 'Request correction',
        icon: 'alert',
        description: 'The supplier must provide a purchase order.',
        status: { tone: 'danger', text: 'Missing PO' },
      },
    },
  ]);
  readonly edges = createEdges([
    {
      id: 'received-review',
      source: 'received',
      target: 'review',
      curve: 'smooth-step',
      markers: { end: {} },
    },
    {
      id: 'review-paid',
      source: 'review',
      target: 'paid',
      curve: 'smooth-step',
      markers: { end: {} },
      // Labels at the start, center and end of the same edge follow its geometry.
      data: { start: 'review', center: 'Approved', end: 'accounting' },
    },
    {
      id: 'review-fix',
      source: 'review',
      target: 'fix',
      curve: 'smooth-step',
      markers: { end: {} },
      data: { center: 'Needs changes' },
    },
  ]);
}
