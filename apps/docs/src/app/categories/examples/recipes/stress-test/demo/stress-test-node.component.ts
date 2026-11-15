import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

/** As light as a card gets: static classes and one text binding; the selection look comes from the core host. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, Vui],
  template: `
    <div vuiNode data-testid="stress-node" class="grid h-12 w-25 place-items-center text-xs">
      {{ node.data().label }}
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </div>
  `,
})
export class StressTestNodeComponent {
  protected readonly node = injectNode<{ label: string }>();
}
