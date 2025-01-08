import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyboardShortcuts, Node, Vflow } from 'projects/ngx-vflow-lib/src/public-api';

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
  standalone: true,
  imports: [Vflow],
})
export class KeyboardShortcutsDemoComponent {
  public shortcuts: KeyboardShortcuts = {
    multiSelection: ['ShiftLeft', 'ShiftRight'],
  };

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default',
      text: `1`,
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'default',
      text: `<strong>2</strong>`,
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      type: 'default-group',
      width: 150,
      height: 150,
    },
  ];
}
