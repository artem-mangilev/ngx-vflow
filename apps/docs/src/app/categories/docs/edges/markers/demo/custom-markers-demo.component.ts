import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Connection, ConnectionSettings, Vflow, addEdges, createEdge, createEdges, createNodes } from 'ngx-vflow';

/**
 * Shapes the library does not ship, declared once per type and used like the built-in arrows. Every shape draws
 * in the marker viewBox with its tip vertex at x = -1, so that the stroke ends at the connection point, and its
 * body towards negative x; `inset` says how far before the connection point the path ends. One marker unit
 * inside the back vertex, the line ends under the stroke: no gap and no line running through an open shape.
 */
@Component({
  template: `<vflow
    #flow
    [nodes]="nodes"
    [edges]="edges()"
    [connection]="connection"
    (connect)="connect($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <ng-template let-ctx vNode>
      @if (ctx.node.id === 'order') {
        <!-- One port per edge, so the start markers do not cover each other. -->
        <div vuiNode class="grid h-27.5 w-25 place-items-center text-[13px]">
          <span>{{ ctx.data().text }}</span>
          <span vuiPort handleType="source" position="right" handleId="top" [offsetY]="-30"></span>
          <span vuiPort handleType="source" position="right" handleId="middle"></span>
          <span vuiPort handleType="source" position="right" handleId="bottom" [offsetY]="30"></span>
        </div>
      } @else {
        <docs-node [ctx]="ctx" />
      }
    </ng-template>
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />

    <ng-template vMarker="circle" inset="8">
      <svg:circle fill="none" cx="-5" cy="0" r="4" />
    </ng-template>
    <ng-template vMarker="circle-closed" inset="8">
      <svg:circle fill="context-stroke" cx="-5" cy="0" r="4" />
    </ng-template>
    <ng-template vMarker="diamond" inset="8">
      <svg:polygon fill="none" points="-1,0 -5,-4 -9,0 -5,4" />
    </ng-template>
    <ng-template vMarker="diamond-closed" inset="8">
      <svg:polygon fill="context-stroke" points="-1,0 -5,-4 -9,0 -5,4" />
    </ng-template>
    <ng-template vMarker="bar" inset="1">
      <svg:line x1="-1" y1="-6" x2="-1" y2="6" />
    </ng-template>
  </vflow>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, Vui],
})
export class CustomMarkersDemoComponent {
  protected readonly nodes = createNodes([
    { id: 'order', point: { x: 0, y: 60 }, data: { text: 'Order' } },
    { id: 'customer', point: { x: 340, y: 0 }, data: { text: 'Customer' } },
    { id: 'payment', point: { x: 340, y: 90 }, data: { text: 'Payment' } },
    { id: 'line-item', point: { x: 340, y: 180 }, data: { text: 'Line item' } },
  ]);

  // Each edge is labeled with its start and end markers.
  protected readonly edges = signal(
    createEdges<{ label?: string }>([
      {
        id: 'order-customer',
        source: 'order',
        sourceHandle: 'top',
        target: 'customer',
        markers: { start: 'circle', end: 'diamond-closed' },
        data: { label: 'circle, diamond-closed' },
      },
      {
        id: 'order-payment',
        source: 'order',
        sourceHandle: 'middle',
        target: 'payment',
        markers: { start: 'circle-closed', end: 'arrow-closed' },
        data: { label: 'circle-closed, arrow-closed' },
      },
      {
        id: 'order-line-item',
        source: 'order',
        sourceHandle: 'bottom',
        target: 'line-item',
        markers: { start: 'bar', end: { type: 'diamond', width: 24 } },
        data: { label: 'bar, diamond 24 wide' },
      },
    ]),
  );

  /** A declared shape ends the connection line as well. */
  protected readonly connection: ConnectionSettings = { markerEnd: 'circle-closed' };

  // The new edge takes the marker of the connection line.
  protected connect(connection: Connection): void {
    const edge = createEdge<{ label?: string }>({
      id: crypto.randomUUID(),
      ...connection,
      markers: { end: 'circle-closed' },
    });

    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }
}
