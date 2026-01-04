import { ChangeDetectionStrategy, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { Vflow, Connection, VflowComponent, Edge, createEdge } from 'ngx-vflow';
import { FlowStoreService } from './services/flow-store.service';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="{ type: 'dots' }"
    [alignmentHelper]="true"
    (connect)="createEdge($event)">
    <ng-template let-ctx edge>
      @if (ctx.edge.data?.().type === 'animated') {
        <svg:path
          class="animated-edge"
          fill="none"
          [attr.d]="ctx.path()"
          [attr.stroke-width]="2"
          [attr.stroke]="'black'"
          [attr.marker-end]="ctx.markerEnd()" />
      }
    </ng-template>

    <ng-template let-ctx edgeLabelHtml>
      @if (ctx.label.data.type === 'text') {
        <div class="label-text">{{ ctx.label.data.text }}</div>
      }

      @if (ctx.label.data.type === 'delete') {
        <div class="label-delete" (click)="deleteEdge(ctx.edge)">×</div>
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
      }

      .label-text {
        height: 25px;
        background-color: #122c26;
        border-radius: 5px;
        text-align: center;
        padding-left: 5px;
        padding-right: 5px;
      }

      .label-delete {
        width: 25px;
        height: 25px;
        background-color: rgb(177, 177, 183);
        border-radius: 5px;
        text-align: center;
        padding-left: 5px;
        padding-right: 5px;
        border-radius: 50%;
      }

      .animated-edge {
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 10; /* Matches the length of the path */
        stroke-dashoffset: 200; /* Initially offset */
        animation: move-white-stroke 4s linear infinite;
      }

      @keyframes move-white-stroke {
        to {
          stroke-dashoffset: 0; /* Move the stroke along the path */
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
}
