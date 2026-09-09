import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, HandleComponent, SelectableDirective, ResizableComponent } from 'ngx-vflow';
import { VflowNode, VflowNodeBody, VflowSelected, VflowGroup } from './primitives.directive';

/** Convenience presentation for migrating core default nodes; use templates for richer content. */
@Component({
  selector: 'vflow-card-node',
  imports: [VflowNode, VflowNodeBody, VflowSelected, HandleComponent, SelectableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    vflowNode
    vflowNodeBody
    selectable
    [vflowSelected]="selected() || preselected()"
    [style.width.px]="node().width?.() ?? 100"
    [style.height.px]="node().height?.() ?? 50">
    {{ data()?.text }}
    <handle type="source" position="right" /><handle type="target" position="left" />
  </div>`,
})
export class VflowCardNode extends CustomNodeComponent {}

/** Container appearance does not establish parenthood; parentId still belongs to graph data. */
@Component({
  selector: 'vflow-container-node',
  imports: [VflowGroup, VflowSelected, SelectableDirective, ResizableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    vflowGroup
    selectable
    [vflowSelected]="selected() || preselected()"
    [resizable]="data()?.resizable ?? false"
    [style.width.px]="node().width?.() ?? 100"
    [style.height.px]="node().height?.() ?? 50">
    {{ data()?.text }}
  </div>`,
})
export class VflowContainerNode extends CustomNodeComponent {}
