import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VuiPort } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

@Component({
  selector: 'node-c',
  template: `
    <div class="custom-node">
      Node C

      <span vuiPort handleType="source" position="right"></span>
      <span vuiPort handleType="target" position="left"></span>
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
  imports: [Vflow, VuiPort],
})
export class NodeCComponent {}
