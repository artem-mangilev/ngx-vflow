import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { Vflow, CustomNodeComponent } from 'ngx-vflow';

// --- Description of blue square component node
export interface BlueSquareData {
  blueSquareText: string;
}

@Component({
  template: `
    <div class="blue-square" (click)="onClick()">
      {{ data()?.blueSquareText }}

      <handle type="target" position="left" />
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
  standalone: true,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlueSquareNodeComponent extends CustomNodeComponent<BlueSquareData> {
  readonly blueSquareEvent = output<{ x: number; y: number }>();

  onClick() {
    this.blueSquareEvent.emit({ x: 5, y: 5 });
  }
}
