import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  template: `<div class="node">
    Input Node

    <handle type="target" position="left" />
  </div>`,
  styles: [
    `
      .node {
        width: 150px;
        height: 100px;
        border: 1.5px solid #1b262c;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        background-color: white;
      }
    `,
  ],
  standalone: true,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlyInputNodeComponent extends CustomNodeComponent {}
