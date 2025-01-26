import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  template: `<div class="node">
    Custom node!

    <handle type="target" position="top" />
    <handle type="source" position="bottom" />
  </div>`,
  styles: [
    `
      .node {
        width: 150px;
        height: 100px;
        background: #bbe1fa;
        border: 1px solid gray;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
      }
    `,
  ],
  standalone: true,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleCustomNodeComponent extends CustomNodeComponent {}
