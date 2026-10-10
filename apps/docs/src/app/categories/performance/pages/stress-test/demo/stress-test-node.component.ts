import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VuiPort } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

@Component({
  selector: 'stress-test-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, VuiPort],
  template: `
    <div class="stress-node" [class.selected]="ctx.selected()">
      {{ ctx.data().label }}
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </div>
  `,
  styles: `
    .stress-node {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 48px;
      border: 1px solid #64748b;
      border-radius: 6px;
      background: white;
      color: #0f172a;
      font-size: 12px;
    }
    .selected {
      border-color: #2563eb;
      background: #eff6ff;
    }
  `,
})
export class StressTestNodeComponent {
  protected readonly ctx = injectNode<{ label: string }>();
}
