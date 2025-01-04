import { Component, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { Vflow, CustomNodeComponent } from "projects/ngx-vflow-lib/src/public-api";

// --- Description of red square component node
export interface RedSquareData {
  redSquareText: string;
}

@Component({
  template: `
    <div class="red-square" (click)="onClick()">
      {{ data()?.redSquareText }}

      <handle type="source" position="right"/>
    </div>
  `,
  styles: [`
    .red-square {
      width: 100px;
      height: 100px;
      background-color: #DE3163;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 5px;
      padding-right: 5px;
    }
  `],
  standalone: true,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedSquareNodeComponent extends CustomNodeComponent<RedSquareData> {
  @Output()
  readonly redSquareEvent = new EventEmitter<string>();

  onClick() {
    this.redSquareEvent.emit('Click from red square');
  }
}
