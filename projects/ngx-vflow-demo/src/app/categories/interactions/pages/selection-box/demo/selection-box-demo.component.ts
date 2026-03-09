import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Edge, Node, SelectionBoxMode, SelectionBoxSettings, Vflow } from 'ngx-vflow';

@Component({
  template: `
    <div class="controls">
      <button type="button" [class.active]="mode() === 'full'" (click)="setMode('full')">Mode: full</button>
      <button type="button" [class.active]="mode() === 'partial'" (click)="setMode('partial')">Mode: partial</button>
      <span class="hint">Hold Shift and drag on canvas</span>
    </div>

    <vflow view="auto" [nodes]="nodes" [edges]="edges" [selectionBox]="selectionBox()" />
  `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 8px;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      button {
        border: 1px solid #cfd8dc;
        background: #fff;
        color: #0f4c75;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
      }

      button.active {
        background: #0f4c75;
        color: #fff;
      }

      .hint {
        color: #4a6572;
        font-size: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class SelectionBoxDemoComponent {
  public mode = signal<SelectionBoxMode>('full');

  public selectionBox = computed<SelectionBoxSettings>(() => ({
    mode: this.mode(),
    color: '#ff8a65',
  }));

  public setMode(mode: SelectionBoxMode) {
    this.mode.set(mode);
  }

  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 40, y: 120 }),
      type: 'default',
      text: signal('Node 1'),
    },
    {
      id: '2',
      point: signal({ x: 260, y: 150 }),
      type: 'default',
      text: signal('Node 2'),
    },
    {
      id: '3',
      point: signal({ x: 430, y: 95 }),
      type: 'default',
      text: signal('Node 3'),
    },
    {
      id: '4',
      point: signal({ x: 360, y: 300 }),
      type: 'default',
      text: signal('Node 4'),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '2 -> 3',
      source: '2',
      target: '3',
    },
    {
      id: '2 -> 4',
      source: '2',
      target: '4',
    },
  ];
}
