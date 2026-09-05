import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import { ComponentNodeEvent, Edge, Node, Vflow, createNodes } from 'ngx-vflow';
import { BlueSquareNodeComponent, BlueSquareData } from './components/blue-square-node.component';
import { RedSquareNodeComponent, RedSquareData } from './components/red-square-node.component';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (componentNodeEvent)="handleComponentEvent($event)" />`,
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
export class CustomComponentNodesDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  public nodes: Node[] = [
    ...createNodes<RedSquareData>([
      {
        id: '1',
        point: { x: 100, y: 100 },
        type: RedSquareNodeComponent,
        data: {
          redSquareText: 'Red',
        },
      },
    ]),
    ...createNodes<BlueSquareData>([
      {
        id: '2',
        point: { x: 250, y: 250 },
        type: BlueSquareNodeComponent,
        data: {
          blueSquareText: 'Blue',
        },
      },
    ]),
  ];

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
