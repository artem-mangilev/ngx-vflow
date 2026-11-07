import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VuiPort } from '@vflow/ui';
import { VxLayout } from '@vflow/layout';
import { forceLayout } from '@vflow/layout/d3-force';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  templateUrl: './force-layout-demo.component.html',
  styleUrls: ['./force-layout-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VuiPort, VxLayout],
})
export class ForceLayoutDemoComponent {
  protected readonly distance = signal(50);
  // A new simulation per distance: the layout host restarts it and applies every tick.
  protected readonly layout = computed(() =>
    forceLayout({ linkDistance: this.distance(), chargeStrength: -100, center: { x: 200, y: 200 }, collide: 4 }),
  );

  protected readonly nodes = createNodes(
    ['0', '1', '2', '3', '4', '5'].map((id) => ({
      id,
      point: { x: 200, y: 200 },
      data: randomHex(),
      draggable: false,
    })),
  );

  protected readonly edges = createEdges(
    ['1', '2', '3', '4', '5'].map((target) => ({ id: `0 -> ${target}`, source: '0', target })),
  );

  protected onDistanceChange(event: Event) {
    this.distance.set(+(event.target as HTMLInputElement).value);
  }
}

function randomHex() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length);
    hex += hexValues[index];
  }

  return hex;
}
