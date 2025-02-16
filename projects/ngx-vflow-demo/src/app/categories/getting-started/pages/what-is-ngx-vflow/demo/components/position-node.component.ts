import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CustomDynamicNodeComponent, Vflow } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

@Component({
  standalone: true,
  template: `
    <div>
      X: {{ connectedNodeX() }}

      <handle position="left" type="target" id="x" />
    </div>

    <div class="bottom-label">
      Y: {{ connectedNodeY() }}

      <handle position="left" type="target" id="y" />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 150px;
        height: 75px;
        padding: 10px;
        border: 1.5px solid #1b262c;
        border-radius: 5px;
        color: black;
        background-color: white;
      }

      .bottom-label {
        margin-top: 5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class PositionNodeComponent extends CustomDynamicNodeComponent {
  public store = inject(FlowStoreService);

  public connectedNodeX = computed(() => {
    const edge = this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'x') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;

    return Math.floor(sourceNode?.point().x ?? 0);
  });

  public connectedNodeY = computed(() => {
    const edge = this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'y') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;

    return Math.floor(sourceNode?.point().y ?? 0);
  });
}
