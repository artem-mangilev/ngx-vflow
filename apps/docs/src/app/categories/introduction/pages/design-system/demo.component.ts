import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { VflowButton } from '@vflow/ui';
import { Node, Vflow, VflowComponent, createNodes } from 'ngx-vflow';

@Component({
  standalone: true,
  imports: [Vflow, VflowButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button vflowButton type="button" (click)="flow()?.fitView()">Fit graph</button>
    <vflow [nodes]="nodes" />
  `,
  styles: `
    :host {
      display: block;
      height: 320px;
    }
    vflow {
      height: 260px;
    }
  `,
})
export class DesignSystemDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly nodes: Node[] = createNodes([
    { id: 'start', type: 'default', text: 'ngx-vflow + @vflow/ui', point: { x: 100, y: 80 } },
  ]);
}
