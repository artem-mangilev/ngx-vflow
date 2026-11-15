import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoIconComponent, DocsKit, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { createNodes, Vflow } from 'ngx-vflow';

interface ServiceData {
  name: string;
  region: string;
  replicas: number;
}

const MAX_REPLICAS = 6;
/** Latency above this is slow. */
const SLOW = 200;

const CHART = { width: 264, height: 56, top: 330 };
/** The shape of the last minutes of traffic, as shares of the current latency. */
const TRAFFIC = [0.62, 0.7, 0.64, 0.8, 0.72, 0.92, 0.7, 0.76, 1.1, 0.84, 0.7, 0.8, 0.96, 0.82, 0.68, 0.88, 1.06, 1];

/**
 * One node of the landing page: a service drawn with plain HTML, an SVG chart and two buttons. The number of replicas
 * is the data of the node; the latency, the status and the chart follow it.
 */
@Component({
  selector: 'app-service-node-flow',
  imports: [Vflow, Vui, DocsKit, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-90' },
  template: `
    <vflow #flow [nodes]="nodes" [edges]="[]" [background]="background" (initialized)="flow.fitView({ maxZoom: 1.2 })">
      <article *vNode="let ctx of nodes" vuiNode class="w-72 text-[13px]">
        @let data = ctx.data();
        @let ms = latency(data.replicas);
        @let slow = ms > slowAbove;
        <header vuiNodeHeader class="items-center">
          <span docsNodeIcon tile class="[--icon-color:var(--color-brand)]"><app-demo-icon name="layers" /></span>
          <span vuiTitle class="grid">
            {{ data.name }}
            <span vuiMeta>{{ data.region }}</span>
          </span>
          <span [docsBadge]="slow ? 'warning' : 'success'">{{ slow ? 'Slow' : 'Healthy' }}</span>
        </header>
        <div
          class="grid gap-vui-2 p-vui-3"
          [class]="slow ? '[--tone:var(--demo-warning)]' : '[--tone:var(--vui-success)]'">
          <div class="flex items-baseline justify-between">
            <span vuiMeta>p95 latency</span>
            <span class="text-xl font-semibold tabular-nums"
              >{{ ms }} <span class="text-xs font-normal text-vui-muted">ms</span></span
            >
          </div>
          <svg
            class="block w-full overflow-visible"
            aria-hidden="true"
            fill="none"
            [attr.viewBox]="'0 0 ' + chart.width + ' ' + chart.height"
            [attr.height]="chart.height">
            <path
              class="fill-(--tone)/12 transition-[d] duration-300 motion-reduce:transition-none"
              [attr.d]="line(ms) + ' V' + chart.height + ' H0 Z'" />
            <path
              class="stroke-(--tone) transition-[d] duration-300 motion-reduce:transition-none"
              stroke-width="1.5"
              stroke-linejoin="round"
              stroke-linecap="round"
              [attr.d]="line(ms)" />
          </svg>
        </div>
        <div vuiRow class="border-t border-vui-separator">
          <span class="flex-1">Replicas</span>
          <button
            docsButton
            small
            icon
            vNoDrag
            vNoSelect
            type="button"
            aria-label="Remove a replica"
            [disabled]="data.replicas === 1"
            (click)="scale(-1)">
            <app-demo-icon name="minus" />
          </button>
          <output class="min-w-4 text-center tabular-nums" aria-label="Replicas">{{ data.replicas }}</output>
          <button
            docsButton
            small
            icon
            vNoDrag
            vNoSelect
            type="button"
            aria-label="Add a replica"
            [disabled]="data.replicas === maxReplicas"
            (click)="scale(+1)">
            <app-demo-icon name="plus" />
          </button>
        </div>
        <!-- The node stands alone here, so its ports start no connection. -->
        <span vuiPort handleType="target" position="left" [canStart]="false"></span>
        <span vuiPort handleType="source" position="right" [canStart]="false"></span>
      </article>
    </vflow>
  `,
})
export class ServiceNodeFlowComponent {
  protected readonly background = SCENE_BACKGROUND;
  protected readonly chart = CHART;
  protected readonly maxReplicas = MAX_REPLICAS;
  protected readonly slowAbove = SLOW;

  protected readonly nodes = createNodes<ServiceData>([
    {
      id: 'checkout-api',
      point: { x: 0, y: 0 },
      data: { name: 'checkout-api', region: 'eu-west-1', replicas: 2 },
      ariaLabel: 'checkout-api service',
    },
  ]);

  protected scale(by: number): void {
    this.nodes[0].data.update((data) => ({ ...data, replicas: data.replicas + by }));
  }

  /** More replicas share the load, so each answers sooner. */
  protected latency(replicas: number): number {
    return Math.round(60 + 240 / replicas);
  }

  /** The chart line for a latency, on one scale for every latency so the line drops as replicas are added. */
  protected line(latency: number): string {
    const step = CHART.width / (TRAFFIC.length - 1);

    return TRAFFIC.map((share, index) => {
      const y = CHART.height * (1 - Math.min((latency * share) / CHART.top, 1));

      return `${index ? 'L' : 'M'}${(index * step).toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }
}
