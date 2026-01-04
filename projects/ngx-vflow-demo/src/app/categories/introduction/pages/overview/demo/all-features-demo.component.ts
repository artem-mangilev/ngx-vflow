import { ChangeDetectionStrategy, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { Vflow, Connection, VflowComponent, Edge, createEdge, ComponentNodeEvent } from 'ngx-vflow';
import { FlowStoreService } from './services/flow-store.service';
import { TransformNodeComponent } from './components/transform-node.component';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="{ type: 'dots' }"
    [optimization]="{ detachedGroupsLayer: true }"
    [alignmentHelper]="true"
    (connect)="createEdge($event)"
    (componentNodeEvent)="onComponentEvent($event)">
    <ng-template let-ctx edge>
      @if (ctx.edge.data?.().type === 'animated') {
        <svg:path
          class="animated-edge"
          fill="none"
          [attr.d]="ctx.path()"
          [attr.stroke-width]="2.5"
          [attr.stroke]="'#8b5cf6'"
          [attr.marker-end]="ctx.markerEnd()" />
      }
    </ng-template>

    <ng-template let-ctx edgeLabelHtml>
      @if (ctx.label.data.type === 'text') {
        <div class="label-text">{{ ctx.label.data.text }}</div>
      }

      @if (ctx.label.data.type === 'delete') {
        <div class="label-delete" (click)="deleteEdge(ctx.edge)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
      }
    </ng-template>

    <mini-map />
  </vflow>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 700px;
        --node-bg: #fafafa;
        --node-border: #e4e4e7;
        --accent-violet: #8b5cf6;
        --accent-emerald: #10b981;
        --accent-amber: #f59e0b;
        --accent-slate: #64748b;
        --text-primary: #18181b;
        --text-muted: #71717a;
      }

      .label-text {
        height: 28px;
        background: var(--node-bg);
        border: 1px solid var(--node-border);
        border-radius: 6px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: var(--text-primary);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .label-delete {
        width: 28px;
        height: 28px;
        background: var(--node-bg);
        border: 1px solid var(--node-border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-muted);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: all 0.15s ease;
      }

      .label-delete:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
        transform: scale(1.1);
      }

      .label-delete:active {
        transform: scale(0.95);
      }

      .animated-edge {
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 8 4;
        animation: dash-flow 1s linear infinite;
      }

      @keyframes dash-flow {
        to {
          stroke-dashoffset: -12;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  providers: [FlowStoreService],
})
export class AllFeaturesDemoComponent {
  protected store = inject(FlowStoreService);

  protected vflow = viewChild.required(VflowComponent);

  constructor() {
    effect(
      () => {
        if (this.vflow().initialized()) {
          untracked(() => this.vflow().fitView());
        }
      },
      { allowSignalWrites: true },
    );
  }

  createEdge(connection: Connection) {
    const id = `${connection.source}${connection.sourceHandle ?? ''}-${connection.target}${connection.targetHandle ?? ''}`;

    this.store.edges.update((edges) => {
      return [
        ...edges,
        createEdge({
          id,
          edgeLabels: {
            center: {
              type: 'html-template',
              data: {
                type: 'delete',
              },
            },
          },
          markers: {
            end: {
              type: 'arrow-closed',
            },
          },
          ...connection,
        }),
      ];
    });
  }

  deleteEdge(edgeToDelete: Edge) {
    this.store.edges.update((edges) => {
      return edges.filter((edge) => edge !== edgeToDelete);
    });
  }

  onComponentEvent(event: ComponentNodeEvent<[TransformNodeComponent]>) {
    if (event.eventName === 'deleted') {
      this.store.nodes.update((nodes) => nodes.filter((node) => node !== event.eventPayload));
    }
  }
}
