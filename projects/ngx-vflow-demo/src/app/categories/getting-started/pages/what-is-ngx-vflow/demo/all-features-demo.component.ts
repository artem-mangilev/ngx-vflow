import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Vflow, Connection } from 'ngx-vflow';
import { FlowStoreService } from './services/flow-store.service';

@Component({
  template: `<vflow
    view="auto"
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="{ type: 'dots' }"
    (onConnect)="createEdge($event)">
    <ng-template let-ctx edge>
      @if (ctx.edge.data?.type === 'animated') {
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
      <div class="label">{{ ctx.label.data.text }}</div>
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 700px;
      }

      .label {
        height: 25px;
        background-color: #122c26;
        border-radius: 5px;
        text-align: center;
        padding-left: 5px;
        padding-right: 5px;
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
  standalone: true,
  imports: [Vflow],
  providers: [FlowStoreService],
})
export class AllFeaturesDemoComponent {
  protected store = inject(FlowStoreService);

  createEdge(connection: Connection) {
    const id = `${connection.source}${connection.sourceHandle ?? ''}-${connection.target}${connection.targetHandle ?? ''}`;

    this.store.edges.update((edges) => {
      return [...edges, { id, ...connection }];
    });
  }
}
