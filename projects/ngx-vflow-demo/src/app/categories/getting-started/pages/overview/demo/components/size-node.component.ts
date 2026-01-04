import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

@Component({
  template: `
    <div>
      width: {{ connectedNodeWidth() }}

      <handle position="left" type="target" id="width" />
    </div>

    <div class="bottom-label">
      height: {{ connectedNodeHeight() }}

      <handle position="left" type="target" id="height" />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 150px;
        height: 100px;
        border: 1.5px solid #1b262c;
        padding: 10px;
        border-radius: 5px;
        color: black;
        background-color: white;
      }

      .bottom-label {
        margin-top: 25px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class SizeNodeComponent extends CustomNodeComponent {
  public store = inject(FlowStoreService);

  public connectedNodeWidth = computed(() => {
    const edge =
      this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'width') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;

    return Math.floor(sourceNode?.width?.() ?? 0);
  });

  public connectedNodeHeight = computed(() => {
    const edge =
      this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'height') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;

    return Math.floor(sourceNode?.height?.() ?? 0);
  });
}
