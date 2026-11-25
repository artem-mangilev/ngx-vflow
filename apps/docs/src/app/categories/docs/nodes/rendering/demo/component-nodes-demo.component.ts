import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import {
  AnyComponentNodeEvent,
  Vflow,
  createEdges,
  createNodes,
  isComponentNodeEvent,
  provideVflow,
  withNodeComponents,
} from 'ngx-vflow';
import { ApprovalData, ApprovalNodeComponent } from './components/approval-node.component';
import { RequestData, RequestNodeComponent } from './components/request-node.component';

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p aria-live="polite">{{ status() }}</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (componentNodeEvent)="handleComponentEvent($event)">
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
  // The nodes name their components by key; the classes are imported once, here.
  providers: [provideVflow(withNodeComponents({ request: RequestNodeComponent, approval: ApprovalNodeComponent }))],
})
export class ComponentNodesDemoComponent {
  protected readonly status = signal('Press a button in a node: the flow reports the output of its component.');

  // The data type is the union of the data of both components.
  protected readonly nodes = createNodes([
    {
      id: 'request',
      point: { x: 0, y: 0 },
      component: 'request',
      data: { title: 'Conference tickets', amount: 480 } satisfies RequestData,
    },
    {
      id: 'approval',
      point: { x: 300, y: 60 },
      component: 'approval',
      data: { approver: 'Dana Whitfield' } satisfies ApprovalData,
    },
  ]);

  protected readonly edges = createEdges([{ id: 'request-approval', source: 'request', target: 'approval' }]);

  // The guard narrows the event to the outputs of one component class, so the payload is typed.
  protected handleComponentEvent(event: AnyComponentNodeEvent): void {
    if (isComponentNodeEvent(event, RequestNodeComponent) && event.eventName === 'submitted') {
      this.status.set(`"${event.eventPayload.title}" submitted for $${event.eventPayload.amount}.`);
    }

    if (isComponentNodeEvent(event, ApprovalNodeComponent) && event.eventName === 'decided') {
      this.status.set(`The request was ${event.eventPayload}.`);
    }
  }
}
