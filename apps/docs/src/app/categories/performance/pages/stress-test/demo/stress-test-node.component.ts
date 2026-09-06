import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  selector: 'stress-test-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  template: `
    <div class="stress-node" selectable [class.selected]="selected()">
      {{ data()?.label }}
      <handle type="target" position="left" />
      <handle type="source" position="right" />
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
export class StressTestNodeComponent extends CustomNodeComponent<{ label: string }> {}
