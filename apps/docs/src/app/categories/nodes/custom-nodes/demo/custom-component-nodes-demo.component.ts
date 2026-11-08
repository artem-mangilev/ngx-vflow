import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import {
  AnyComponentNodeEvent,
  Edge,
  Vflow,
  createNodes,
  isComponentNodeEvent,
  provideVflow,
  withNodeComponents,
} from 'ngx-vflow';
import { BlueSquareNodeComponent, BlueSquareData } from './components/blue-square-node.component';
import { RedSquareNodeComponent, RedSquareData } from './components/red-square-node.component';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" (componentNodeEvent)="handleComponentEvent($event)">
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
  // The nodes name their components by key; the classes are imported once, here.
  providers: [provideVflow(withNodeComponents({ red: RedSquareNodeComponent, blue: BlueSquareNodeComponent }))],
})
export class CustomComponentNodesDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  // The data type is the union of the data of both components.
  public nodes = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      component: 'red',
      data: {
        redSquareText: 'Red',
      } satisfies RedSquareData,
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      component: 'blue',
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

  // The guard narrows the event to the outputs of one component class, so the payload is typed.
  handleComponentEvent(event: AnyComponentNodeEvent) {
    if (isComponentNodeEvent(event, RedSquareNodeComponent) && event.eventName === 'redSquareEvent') {
      this.notifyService.notify(event.eventPayload);
    }

    if (isComponentNodeEvent(event, BlueSquareNodeComponent) && event.eventName === 'blueSquareEvent') {
      this.notifyService.notify(`${event.eventPayload.x + event.eventPayload.y}`);
    }
  }
}
