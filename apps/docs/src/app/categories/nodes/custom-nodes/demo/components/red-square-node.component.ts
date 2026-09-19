import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { VflowPort } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

// --- Description of red square component node
export interface RedSquareData {
  redSquareText: string;
}

@Component({
  template: `
    <div class="red-square" (click)="onClick()">
      {{ ctx.data().redSquareText }}

      <span vflowPort handleType="source" position="right"></span>
    </div>
  `,
  styles: [
    `
      .red-square {
        width: 100px;
        height: 100px;
        background-color: #de3163;
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
export class RedSquareNodeComponent {
  protected readonly ctx = injectNode<RedSquareData>();
  @Output()
  readonly redSquareEvent = new EventEmitter<string>();

  onClick() {
    this.redSquareEvent.emit('Click from red square');
  }
}
