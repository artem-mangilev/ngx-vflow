import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

type Kind = 'pool' | 'lane' | 'task' | 'start' | 'intermediate' | 'end' | 'exclusive' | 'parallel' | 'annotation';
type Flow = 'sequence' | 'message' | 'association';

@Component({
  selector: 'app-ui-bpmn-demo',
  imports: [Vflow, VflowUi, VflowBpmn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  template: `
    <section class="demo" aria-label="BPMN presentation demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit process</button>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <p>Two pools with a message flow between them; drag tasks inside lanes. A visual subset without execution.</p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx groupNode>
          @if (ctx.data().kind === 'pool') {
            <div
              vflowBpmnPool
              selectable
              [vflowSelected]="ctx.selected() || ctx.preselected()"
              [style.width.px]="ctx.width()"
              [style.height.px]="ctx.height()">
              <strong vflowTitle>{{ ctx.data().title }}</strong>
              <!-- The supplier pool takes part in message flows through its own handles. -->
              @if (ctx.node.id === 'supplier') {
                <handle
                  type="target"
                  position="bottom"
                  id="message-in"
                  [template]="port"
                  [canStart]="false"
                  [offsetX]="ctx.width() * -0.4" />
                <handle
                  type="source"
                  position="bottom"
                  id="message-out"
                  [template]="port"
                  [canAccept]="false"
                  [offsetX]="ctx.width() * 0.4" />
              }
            </div>
          } @else {
            <div
              vflowBpmnLane
              selectable
              [vflowSelected]="ctx.selected() || ctx.preselected()"
              [style.width.px]="ctx.width()"
              [style.height.px]="ctx.height()">
              <strong vflowTitle>{{ ctx.data().title }}</strong>
            </div>
          }
        </ng-template>
        <ng-template let-ctx nodeHtml>
          @switch (ctx.data().kind) {
            @case ('task') {
              <div vflowBpmnTask class="task" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                {{ ctx.data().title }}
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                <handle type="source" position="right" [template]="port" [canStart]="false" [canAccept]="false" />
                @if (ctx.node.id === 'notify') {
                  <handle type="source" position="top" id="message-out" [template]="port" [canAccept]="false" />
                }
              </div>
            }
            @case ('exclusive') {
              <div vflowBpmnGateway="exclusive" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <span vflowExternalLabel>{{ ctx.data().title }}</span>
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                <handle type="target" position="top" id="association" [template]="port" [canStart]="false" />
                <handle type="source" position="right" id="yes" [template]="port" [canStart]="false" />
                <handle type="source" position="bottom" id="no" [template]="port" [canStart]="false" />
              </div>
            }
            @case ('parallel') {
              <div vflowBpmnGateway="parallel" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <span vflowExternalLabel>{{ ctx.data().title }}</span>
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="false" />
                <handle type="source" position="right" id="a" [template]="port" [canStart]="false" />
                <handle type="source" position="bottom" id="b" [template]="port" [canStart]="false" />
              </div>
            }
            @case ('annotation') {
              <div class="annotation" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                {{ ctx.data().title }}
                <handle type="source" position="bottom" [template]="port" [canAccept]="false" />
              </div>
            }
            @default {
              <div selectable [vflowBpmnEvent]="ctx.data().kind" [vflowSelected]="ctx.selected() || ctx.preselected()">
                @if (ctx.data().kind === 'intermediate') {
                  <span class="symbol" aria-hidden="true">◷</span>
                }
                <span vflowExternalLabel>{{ ctx.data().title }}</span>
                @if (ctx.data().kind === 'start') {
                  <handle type="target" position="top" id="message-in" [template]="port" [canStart]="false" />
                } @else {
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
              [vflowBpmnFlow]="ctx.data()?.flow ?? 'sequence'"
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
        <ng-template let-ctx edgeLabelHtml>
          <span vflowEdgeLabel>{{ ctx.label.data }}</span>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle><span vflowPort [vflowPortState]="ctx.state()"></span></ng-template>
    </section>
  `,
  styles: `
    .task {
      width: 150px;
      min-height: 70px;
    }
    .symbol {
      font-size: 28px;
    }
    .annotation {
      width: 130px;
      padding: 6px 8px;
      border-left: 2px solid var(--vui-foreground);
      font-size: 12px;
      color: var(--vui-foreground);
    }
    .annotation[data-vui-selected='true'] {
      outline: 2px solid var(--vui-accent);
      outline-offset: 2px;
    }
  `,
})
export class BpmnDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly nodes = createNodes<{ kind: Kind; title: string }>([
    // Participants and lanes are frames; parent relationships live in graph data.
    group('supplier', { x: 20, y: 20 }, 1040, 90, 'pool', 'Supplier'),
    group('company', { x: 20, y: 170 }, 1040, 400, 'pool', 'Company'),
    { ...group('operations', { x: 32, y: 6 }, 1000, 190, 'lane', 'Operations'), parentId: 'company' },
    { ...group('finance', { x: 32, y: 202 }, 1000, 190, 'lane', 'Finance'), parentId: 'company' },
    element('start', { x: 60, y: 62 }, 'operations', 'start', 'Invoice received'),
    element('validate', { x: 170, y: 55 }, 'operations', 'task', 'Validate invoice'),
    element('decision', { x: 390, y: 58 }, 'operations', 'exclusive', 'Under limit?'),
    element('limit', { x: 440, y: 2 }, 'operations', 'annotation', 'Limit: 10 000'),
    element('timer', { x: 560, y: 62 }, 'operations', 'intermediate', 'Payment date'),
    element('review', { x: 250, y: 55 }, 'finance', 'task', 'Manual approval'),
    element('pay', { x: 470, y: 55 }, 'finance', 'task', 'Pay supplier'),
    element('split', { x: 660, y: 58 }, 'finance', 'parallel', 'Also'),
    element('end', { x: 760, y: 30 }, 'finance', 'end', 'Paid'),
    element('notify', { x: 820, y: 118 }, 'finance', 'task', 'Notify supplier'),
  ]);
  readonly edges = createEdges([
    sequence('start-validate', 'start', 'validate'),
    sequence('validate-decision', 'validate', 'decision'),
    { ...sequence('decision-timer', 'decision', 'timer', 'yes'), edgeLabels: label('Yes') },
    { ...sequence('decision-review', 'decision', 'review', 'no'), edgeLabels: label('No') },
    sequence('timer-pay', 'timer', 'pay'),
    sequence('review-pay', 'review', 'pay'),
    sequence('pay-split', 'pay', 'split'),
    sequence('split-end', 'split', 'end', 'a'),
    sequence('split-notify', 'split', 'notify', 'b'),
    // Message flows cross pool boundaries; the supplier pool connects through its own handles.
    message('supplier-start', 'supplier', 'message-out', 'start', 'message-in', 'Invoice'),
    message('notify-supplier', 'notify', 'message-out', 'supplier', 'message-in', 'Payment'),
    // An association attaches the annotation to the gateway without arrows.
    {
      id: 'limit-decision',
      source: 'limit',
      target: 'decision',
      targetHandle: 'association',
      curve: 'straight' as const,
      data: { flow: 'association' as Flow },
    },
  ]);

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }
}

function group(id: string, point: { x: number; y: number }, width: number, height: number, kind: Kind, title: string) {
  return {
    id,
    type: 'template-group' as const,
    point,
    width,
    height,
    ariaLabel: `${title} ${kind}`,
    data: { kind, title },
  };
}

function element(id: string, point: { x: number; y: number }, parentId: string, kind: Kind, title: string) {
  return { id, type: 'html-template' as const, point, parentId, ariaLabel: `${kind}: ${title}`, data: { kind, title } };
}

function sequence(id: string, source: string, target: string, sourceHandle?: string) {
  return {
    id,
    source,
    target,
    sourceHandle,
    curve: 'smooth-step' as const,
    markers: { end: { type: 'arrow-closed' as const } },
    data: { flow: 'sequence' as Flow },
  };
}

function message(id: string, source: string, sourceHandle: string, target: string, targetHandle: string, text: string) {
  return {
    id,
    source,
    sourceHandle,
    target,
    targetHandle,
    curve: 'smooth-step' as const,
    markers: { end: { type: 'arrow' as const } },
    edgeLabels: label(text),
    data: { flow: 'message' as Flow },
  };
}

function label(text: string) {
  return { center: { type: 'html-template' as const, data: text } };
}
