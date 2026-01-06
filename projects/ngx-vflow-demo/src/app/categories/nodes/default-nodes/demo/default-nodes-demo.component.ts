import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" />`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class DefaultNodesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: 'default',
      // it's possible to pass html in this field
      text: signal(`<strong>2</strong>`),
    },
  ];
}
