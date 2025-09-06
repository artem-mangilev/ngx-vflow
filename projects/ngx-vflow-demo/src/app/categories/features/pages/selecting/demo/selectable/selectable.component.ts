import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HandleComponent, SelectableDirective } from 'ngx-vflow';

@Component({
  selector: 'app-selectable',
  template: `
    <div class="custom-node" [class.custom-node_selected]="selected()">
      <button class="custom-node__button" selectable>Select here</button>

      <handle type="source" position="right" />
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

      &__button {
        border: 0;
        outline: 0;
        cursor: pointer;
        color: white;
        background-color: #1b262c;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        padding: 4px 8px;
        display: inline-block;
        min-height: 28px;
      }

      &_selected {
        border-color: #1b262c;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HandleComponent, SelectableDirective],
})
export class SelectableComponent {
  selected = input<boolean>(false);
}
