import { ChangeDetectionStrategy, Component, WritableSignal } from "@angular/core";
import { Vflow, CustomNodeComponent } from "projects/ngx-vflow-lib/src/public-api";

export interface ComplexCustomNodeData {
  id: {
    one: WritableSignal<string>,
    two: WritableSignal<string>,
    three: WritableSignal<string>,
  }
}

@Component({
  template: `<div class="node">
    <div class="control-wrapper">
      <input class="input" [value]="data()?.id?.one()">

      <handle type="target" position="left" id="one" [template]="squareHandleTemplate" />
    </div>

    <div class="control-wrapper">
      <input class="input" [value]="data()?.id?.two()">

      <handle type="target" position="left" id="two" [template]="squareHandleTemplate"  />
    </div>

    <div class="control-wrapper control-wrapper_last">
      <input class="input"  [value]="data()?.id?.three()">

      <handle type="target" position="left" id="three" [template]="squareHandleTemplate" />
    </div>
  </div>

  <ng-template #squareHandleTemplate let-ctx>
    <svg:rect
      width="10"
      height="10"
      stroke-width="1"
      stroke="black"
      rx="1"
      ry="1"
      [attr.x]="ctx.point().x - 5"
      [attr.y]="ctx.point().y - 5"
      [class.handle_idle]="ctx.state() === 'idle'"
      [class.handle_valid]="ctx.state() === 'valid'"
      [class.handle_invalid]="ctx.state() === 'invalid'"
    />
  </ng-template>

  `,
  styles: [`
    .node {
      width: 150px;
      background: #bbe1fa;
      border: 1px solid gray;
      border-radius: 5px;
      color: black;
      padding: 10px;
    }

    .input {
      width: 130px;
    }

    .control-wrapper {
      margin-bottom: 20px;
    }

    .control-wrapper_last {
      margin-bottom: 0px;
    }

    .handle {
      &_idle {
        fill: #fff;
      }

      &_valid {
        fill: green;
      }

      &_invalid {
        fill: red;
      }
    }
  `],
  standalone: true,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplexCustomNodeComponent extends CustomNodeComponent<ComplexCustomNodeData> { }
