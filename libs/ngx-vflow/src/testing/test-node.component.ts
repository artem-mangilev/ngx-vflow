import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent } from '../lib/vflow/public-components/custom-node/custom-node.component';
import { HandleComponent } from '../lib/vflow/public-components/handle/handle.component';
import { SelectableDirective } from '../lib/vflow/directives/selectable.directive';

/** Application-owned presentation used by core integration tests. */
@Component({
  selector: 'test-node',
  imports: [HandleComponent, SelectableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div selectable [style.width.px]="node().width?.() ?? 100" [style.height.px]="node().height?.() ?? 50">
    {{ data()?.text }}<handle type="source" position="right" /><handle type="target" position="left" />
  </div>`,
})
export class TestNodeComponent extends CustomNodeComponent {}
