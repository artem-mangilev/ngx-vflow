import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { VflowPort } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

// --- Description of blue square component node
export interface BlueSquareData {
  blueSquareText: string;
}

@Component({
  template: `
    <div class="blue-square" (click)="onClick()">
      {{ ctx.data().blueSquareText }}

      <span vflowPort type="target" position="left"></span>
    </div>
  `,
  styles: [
    `
      .blue-square {
        width: 100px;
        height: 100px;
        background-color: #0096ff;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 5px;
        padding-right: 5px;
      }
    `,
  ],
  imports: [Vflow, VflowPort],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlueSquareNodeComponent {
  protected readonly ctx = injectNode<BlueSquareData>();
  readonly blueSquareEvent = output<{ x: number; y: number }>();

  onClick() {
    this.blueSquareEvent.emit({ x: 5, y: 5 });
  }
}
