import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'app-ui-bpmn-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    .task {
      width: 170px;
      min-height: 74px;
      display: grid;
      place-items: center;
      text-align: center;
    }
    .symbol {
      font-size: 28px;
    }
    .lane {
      border-style: solid;
      border-radius: 0;
    }
    .lane-title {
      position: absolute;
      top: 0;
      bottom: 0;
      padding: 12px;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      border-bottom: 0;
      border-left: 1px solid var(--vui-border);
    }
  `,
  template: `
    <section class="demo" aria-label="BPMN presentation demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit process</button>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>Drag tasks inside lanes. A visual subset; no BPMN execution or XML model.</p>
      </div>
      <vflow view="auto" background="var(--vui-canvas)" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx groupNode>
          <div
            vflowContainer
            class="lane"
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [style.width.px]="ctx.width()"
            [style.height.px]="ctx.height()">
            <strong vflowTitle class="lane-title">{{ ctx.data().title }}</strong>
          </div>
        </ng-template>
        <ng-template let-ctx nodeHtml>
          @switch (ctx.data().kind) {
            @case ('task') {
              <div
                vflowNode
                vflowNodeBody
                class="task"
                selectable
                [vflowSelected]="ctx.selected() || ctx.preselected()">
                {{ ctx.data().title }}
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                <handle type="source" position="right" [template]="port" [canStart]="false" [canAccept]="false" />
              </div>
            }
            @case ('gateway') {
              <div vflowBpmnGateway selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <span aria-hidden="true">×</span>
                <span vflowExternalLabel>{{ ctx.data().title }}</span>
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                <handle
                  type="source"
                  position="right"
                  id="yes"
                  [template]="port"
                  [canStart]="false"
                  [canAccept]="false" />
                <handle
                  type="source"
                  position="bottom"
                  id="no"
                  [template]="port"
                  [canStart]="false"
                  [canAccept]="false" />
              </div>
            }
            @default {
              <div selectable [vflowBpmnEvent]="ctx.data().kind" [vflowSelected]="ctx.selected() || ctx.preselected()">
                @if (ctx.data().kind === 'intermediate') {
                  <span class="symbol" aria-hidden="true">◷</span>
                }
                <span vflowExternalLabel>{{ ctx.data().title }}</span>
                @if (ctx.data().kind !== 'start') {
                  <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                }
                @if (ctx.data().kind !== 'end') {
                  <handle type="source" position="right" [template]="port" [canStart]="false" [canAccept]="false" />
                }
              </div>
            }
          }
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
        <ng-template let-ctx edgeLabelHtml
          ><span vflowEdgeLabel>{{ ctx.label.data }}</span></ng-template
        >
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
})
export class BpmnDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly nodes = createNodes([
    {
      id: 'operations',
      type: 'template-group',
      point: { x: 20, y: 20 },
      width: 1010,
      height: 190,
      ariaLabel: 'Operations lane',
      data: { title: 'Operations', kind: 'lane' },
    },
    {
      id: 'finance',
      type: 'template-group',
      point: { x: 20, y: 210 },
      width: 1010,
      height: 190,
      ariaLabel: 'Finance lane',
      data: { title: 'Finance', kind: 'lane' },
    },
    {
      id: 'start',
      type: 'html-template',
      point: { x: 80, y: 60 },
      parentId: 'operations',
      ariaLabel: 'Start: invoice received',
      data: { kind: 'start', title: 'Invoice received' },
    },
    {
      id: 'validate',
      type: 'html-template',
      point: { x: 220, y: 52 },
      parentId: 'operations',
      ariaLabel: 'Task: validate invoice',
      data: { kind: 'task', title: 'Validate invoice' },
    },
    {
      id: 'decision',
      type: 'html-template',
      point: { x: 460, y: 56 },
      parentId: 'operations',
      ariaLabel: 'Exclusive gateway: under limit?',
      data: { kind: 'gateway', title: 'Under limit?' },
    },
    {
      id: 'timer',
      type: 'html-template',
      point: { x: 620, y: 60 },
      parentId: 'operations',
      ariaLabel: 'Intermediate timer: payment date',
      data: { kind: 'intermediate', title: 'Payment date' },
    },
    {
      id: 'review',
      type: 'html-template',
      point: { x: 310, y: 55 },
      parentId: 'finance',
      ariaLabel: 'Task: manual approval',
      data: { kind: 'task', title: 'Manual approval' },
    },
    {
      id: 'pay',
      type: 'html-template',
      point: { x: 620, y: 55 },
      parentId: 'finance',
      ariaLabel: 'Task: pay supplier',
      data: { kind: 'task', title: 'Pay supplier' },
    },
    {
      id: 'end',
      type: 'html-template',
      point: { x: 890, y: 64 },
      parentId: 'finance',
      ariaLabel: 'End: paid',
      data: { kind: 'end', title: 'Paid' },
    },
  ]);
  readonly edges = createEdges(
    [
      { id: 'start-validate', source: 'start', target: 'validate' },
      { id: 'validate-decision', source: 'validate', target: 'decision' },
      {
        id: 'decision-timer',
        source: 'decision',
        sourceHandle: 'yes',
        target: 'timer',
        edgeLabels: { center: { type: 'html-template' as const, data: 'Yes' } },
      },
      {
        id: 'decision-review',
        source: 'decision',
        sourceHandle: 'no',
        target: 'review',
        edgeLabels: { center: { type: 'html-template' as const, data: 'No' } },
      },
      { id: 'timer-pay', source: 'timer', target: 'pay' },
      { id: 'review-pay', source: 'review', target: 'pay' },
      { id: 'pay-end', source: 'pay', target: 'end' },
    ].map((edge) => ({
      ...edge,
      type: 'template' as const,
      curve: 'smooth-step' as const,
      markers: { end: { color: 'var(--vui-foreground)' } },
    })),
  );

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
}
