import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VflowPort } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

@Component({
  selector: 'node-a',
  template: `
    <div class="custom-node">
      Node A

      <span vflowPort type="source" position="right"></span>
      <span vflowPort type="target" position="left"></span>
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
  imports: [Vflow, VflowPort],
})
export class NodeAComponent {}
