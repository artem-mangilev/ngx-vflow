import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  selector: 'node-c',
  template: `
    <div class="custom-node">
      Node C

      <handle type="source" position="right" />
      <handle type="target" position="left" />
    </div>
  `,
  styles: `
    .custom-node {
      width: 150px;
      height: 100px;
      background: #bbe1fa;
      border: 1px solid gray;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class NodeCComponent extends CustomNodeComponent {}
