import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, VflowComponent, createNodes } from 'ngx-vflow';

type GestureSetting = 'panOnDrag' | 'panOnScroll' | 'zoomOnScroll' | 'zoomOnPinch' | 'zoomOnDoubleClick';

@Component({
  template: `
    <div class="controls">
      @for (setting of settings; track setting) {
        <label>
          <input type="checkbox" [checked]="enabled()[setting]" (change)="toggle(setting)" />
          {{ setting }}
        </label>
      }
      <button type="button" (click)="flow().fitView({ duration: 500 })">Fit view</button>
      <output class="readout" aria-live="off">
        x {{ viewport().x | number: '1.0-1' }}, y {{ viewport().y | number: '1.0-1' }}, zoom
        {{ viewport().zoom | number: '1.2-2' }}
      </output>
    </div>

    <vflow
      view="auto"
      [nodes]="nodes"
      [edges]="edges"
      [panOnDrag]="enabled().panOnDrag"
      [panOnScroll]="enabled().panOnScroll"
      [zoomOnScroll]="enabled().zoomOnScroll"
      [zoomOnPinch]="enabled().zoomOnPinch"
      [zoomOnDoubleClick]="enabled().zoomOnDoubleClick">
      <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
      <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
    </vflow>
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
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 14px;
        font-size: 13px;
      }

      label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      button {
        border: 1px solid #cfd8dc;
        background: #fff;
        color: #0f4c75;
        border-radius: 6px;
        padding: 4px 10px;
        cursor: pointer;
      }

      .readout {
        color: #4a6572;
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, DecimalPipe],
})
export class ViewportGesturesDemoComponent {
  protected readonly flow = viewChild.required(VflowComponent);

  protected readonly settings: GestureSetting[] = [
    'panOnDrag',
    'panOnScroll',
    'zoomOnScroll',
    'zoomOnPinch',
    'zoomOnDoubleClick',
  ];

  protected readonly enabled = signal<Record<GestureSetting, boolean>>({
    panOnDrag: true,
    panOnScroll: false,
    zoomOnScroll: true,
    zoomOnPinch: true,
    zoomOnDoubleClick: true,
  });

  protected readonly viewport = computed(() => this.flow().viewport());

  protected toggle(setting: GestureSetting) {
    this.enabled.update((enabled) => ({ ...enabled, [setting]: !enabled[setting] }));
  }

  public nodes: Node[] = createNodes([
    { id: '1', point: { x: 40, y: 60 }, data: { text: 'Drag me' } },
    { id: '2', point: { x: 260, y: 20 }, data: { text: 'Node 2' } },
    { id: '3', point: { x: 260, y: 160 }, data: { text: 'Node 3' } },
    { id: '4', point: { x: 480, y: 90 }, data: { text: 'Node 4' } },
  ]);

  public edges: Edge[] = [
    { id: '1 -> 2', source: '1', target: '2' },
    { id: '1 -> 3', source: '1', target: '3' },
    { id: '2 -> 4', source: '2', target: '4' },
    { id: '3 -> 4', source: '3', target: '4' },
  ];
}
