import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import { ComponentNodeEvent, Edge, Vflow, createNodes } from 'ngx-vflow';
import { BlueSquareNodeComponent, BlueSquareData } from './components/blue-square-node.component';
import { RedSquareNodeComponent, RedSquareData } from './components/red-square-node.component';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (componentNodeEvent)="handleComponentEvent($event)">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class CustomComponentNodesDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  // The data type is the union of the data of both components.
  public nodes = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      component: RedSquareNodeComponent,
      data: {
        redSquareText: 'Red',
      } satisfies RedSquareData,
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      component: BlueSquareNodeComponent,
      data: {
        blueSquareText: 'Blue',
      } satisfies BlueSquareData,
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
  ];

  // Type-safe!
  handleComponentEvent(event: ComponentNodeEvent<[RedSquareNodeComponent, BlueSquareNodeComponent]>) {
    if (event.eventName === 'redSquareEvent') {
      this.notifyService.notify(event.eventPayload);
    }

    if (event.eventName === 'blueSquareEvent') {
      this.notifyService.notify(`${event.eventPayload.x + event.eventPayload.y}`);
    }
  }
}
