import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

/** The application's own fields live in `data`; `kind` tells the template which card to draw. */
type ServiceData = { kind: 'service'; name: string; runtime: string; requests: string };
type QueueData = { kind: 'queue'; name: string; waiting: number };

@Component({
  template: `<vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
    <ng-template let-ctx vNode [vNodeOf]="nodes">
      @let data = ctx.data();

      @switch (data.kind) {
        @case ('service') {
          <article vuiNode class="w-48 text-[13px]">
            <header vuiNodeHeader>
              <span vuiTitle>{{ data.name }}</span>
              <span vuiMeta>{{ data.runtime }}</span>
            </header>
            <div vuiRow>
              <span vuiMeta>Requests</span>
              <span class="ms-auto tabular-nums">{{ data.requests }}</span>
            </div>
            <span vuiPort handleType="target" position="left"></span>
            <span vuiPort handleType="source" position="right"></span>
          </article>
        }
        @case ('queue') {
          <article vuiNode class="text-[13px]">
            <div vuiRow>
              <span vuiTitle>{{ data.name }}</span>
              <span vuiMeta>{{ data.waiting }} waiting</span>
            </div>
            <span vuiPort handleType="target" position="left"></span>
            <span vuiPort handleType="source" position="right"></span>
          </article>
        }
      }
    </ng-template>

    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class CustomNodesDemoComponent {
  protected readonly nodes = createNodes<ServiceData | QueueData>([
    {
      id: 'gateway',
      point: { x: 0, y: 0 },
      data: { kind: 'service', name: 'API gateway', runtime: 'Node 22', requests: '1.2k / min' },
    },
    {
      id: 'events',
      point: { x: 260, y: 110 },
      data: { kind: 'queue', name: 'order-events', waiting: 12 },
    },
    {
      id: 'billing',
      point: { x: 500, y: 0 },
      data: { kind: 'service', name: 'Billing', runtime: 'Go 1.24', requests: '310 / min' },
    },
  ]);

  protected readonly edges = createEdges([
    { id: 'gateway-events', source: 'gateway', target: 'events' },
    { id: 'events-billing', source: 'events', target: 'billing' },
  ]);
}
