import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import { ComponentNodeEvent, Edge, Node, Vflow } from 'projects/ngx-vflow-lib/src/public-api';
import { BlueSquareNodeComponent, BlueSquareData } from './components/blue-square-node.component';
import { RedSquareNodeComponent, RedSquareData } from './components/red-square-node.component';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" (onComponentNodeEvent)="handleComponentEvent($event)" />`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow]
})
export class CustomComponentNodesDemoComponent {
  private notifyService = inject(NgDocNotifyService)

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: RedSquareNodeComponent,
      data: {
        redSquareText: 'Red',
      } satisfies RedSquareData
    },
    {
      id: '2',
      point: { x: 250, y: 250 },
      type: BlueSquareNodeComponent,
      data: {
        blueSquareText: 'Blue',
      } satisfies BlueSquareData
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2'
    }
  ]

  // Type-safe!
  handleComponentEvent(event: ComponentNodeEvent<[RedSquareNodeComponent, BlueSquareNodeComponent]>) {
    if (event.eventName === 'redSquareEvent') {
      this.notifyService.notify(event.eventPayload)
    }

    if (event.eventName === 'blueSquareEvent') {
      this.notifyService.notify(`${event.eventPayload.x + event.eventPayload.y}`)
    }
  }
}


