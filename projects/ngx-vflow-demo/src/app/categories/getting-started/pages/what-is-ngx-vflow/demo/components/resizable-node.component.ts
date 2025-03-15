import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomDynamicNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  standalone: true,
  template: ` <div class="resizable" selectable [resizable]="selected()">
    Resizable Node

    <handle type="target" position="left" />
    <handle type="source" position="right" />
  </div>`,
  styles: [
    `
      :host {
        display: contents;
      }

      .resizable {
        min-width: 150px;
        min-height: 100px;
        height: 100%;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class ResizableNodeComponent extends CustomDynamicNodeComponent {}
