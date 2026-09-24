import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowUi } from '@vflow/ui';
import { ConnectionSettings, Edge, Node, Vflow, createEdges, createNodes } from 'ngx-vflow';

/**
 * Shapes the library does not ship, declared once per type and used like the built-in arrows. Every shape draws
 * in the marker viewBox with its tip at x = 0 and its body towards negative x; `inset` says how far before the tip
 * the path ends. One marker unit inside the back of the shape, the line ends under its stroke: no gap and no line
 * running through an open circle or diamond.
 */
@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connectionSettings">
    <ng-template let-ctx node>
      @if (ctx.node.id === '1') {
        <div vflowNode class="source" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
          <span>1</span>
          <span vflowPort handleType="source" position="right" handleId="top" [offsetY]="-30"></span>
          <span vflowPort handleType="source" position="right" handleId="middle"></span>
          <span vflowPort handleType="source" position="right" handleId="bottom" [offsetY]="30"></span>
        </div>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>

    <ng-template marker="circle" inset="9">
      <svg:circle fill="none" cx="-5" cy="0" r="4" />
    </ng-template>
    <ng-template marker="circle-closed" inset="9">
      <svg:circle fill="context-stroke" cx="-5" cy="0" r="4" />
    </ng-template>
    <ng-template marker="diamond" inset="9">
      <svg:polygon fill="none" points="0,0 -5,-5 -10,0 -5,5" />
    </ng-template>
    <ng-template marker="diamond-closed" inset="9">
      <svg:polygon fill="context-stroke" points="0,0 -5,-5 -10,0 -5,5" />
    </ng-template>
    <ng-template marker="bar" inset="1">
      <svg:line x1="-1" y1="-6" x2="-1" y2="6" />
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }

      .source {
        width: 100px;
        height: 110px;
        display: grid;
        place-items: center;
        font-size: 13px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VflowUi],
})
export class CustomMarkersDemoComponent {
  public nodes: Node[] = createNodes([
    { id: '1', point: { x: 0, y: 145 }, data: { text: '1' } },
    { id: '2', point: { x: 250, y: 25 }, data: { text: '2' } },
    { id: '3', point: { x: 250, y: 175 }, data: { text: '3' } },
    { id: '4', point: { x: 250, y: 325 }, data: { text: '4' } },
  ]);

  public edges: Edge[] = createEdges([
    {
      id: '1 -> 2',
      source: '1',
      sourceHandle: 'top',
      target: '2',
      markers: { start: 'circle', end: 'diamond-closed' },
    },
    {
      id: '1 -> 3',
      source: '1',
      sourceHandle: 'middle',
      target: '3',
      markers: { start: 'circle-closed', end: { type: 'arrow-closed' } },
    },
    {
      id: '1 -> 4',
      source: '1',
      sourceHandle: 'bottom',
      target: '4',
      markers: { start: 'bar', end: { type: 'diamond', width: 24, height: 24 } },
    },
  ]);

  public connectionSettings: ConnectionSettings = { marker: 'circle-closed' };
}
