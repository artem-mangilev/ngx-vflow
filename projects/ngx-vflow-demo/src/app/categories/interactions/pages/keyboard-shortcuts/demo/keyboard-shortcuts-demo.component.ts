import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KeyboardShortcuts, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [keyboardShortcuts]="shortcuts" />`,
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
export class KeyboardShortcutsDemoComponent {
  public shortcuts: KeyboardShortcuts = {
    multiSelection: ['ShiftLeft', 'ShiftRight'],
  };

  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 10, y: 10 }),
      type: 'default',
      text: signal(`1`),
      parentId: signal('3'),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: 'default',
      text: signal(`<strong>2</strong>`),
    },
    {
      id: '3',
      point: signal({ x: 10, y: 10 }),
      type: 'default-group',
      width: signal(150),
      height: signal(150),
    },
  ];
}
