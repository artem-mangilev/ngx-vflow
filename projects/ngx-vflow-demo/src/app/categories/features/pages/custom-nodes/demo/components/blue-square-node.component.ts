import { Component, Output, EventEmitter, output } from "@angular/core";
import { Vflow, CustomNodeComponent } from "projects/ngx-vflow-lib/src/public-api";

// --- Description of blue square component node
export interface BlueSquareData {
  blueSquareText: string;
}

@Component({
  template: `
    <div class="blue-square" (click)="onClick()">
      {{ data()?.blueSquareText }}

      <handle type="target" position="left"/>
    </div>
  `,
  styles: [`
    .blue-square {
      width: 100px;
      height: 100px;
      background-color: #0096FF;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 5px;
      padding-right: 5px;
    }
  `],
  standalone: true,
  imports: [Vflow]
})
export class BlueSquareNodeComponent extends CustomNodeComponent<BlueSquareData> {
  blueSquareEvent = output<{ x: number; y: number; }>();

  onClick() {
    this.blueSquareEvent.emit({ x: 5, y: 5 });
  }
}
