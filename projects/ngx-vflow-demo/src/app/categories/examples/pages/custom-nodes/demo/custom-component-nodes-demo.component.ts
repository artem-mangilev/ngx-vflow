import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import { ComponentNodeEvent, CustomNodeComponent, Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" (onComponentNodeEvent)="handleComponentEvent($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
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

// --- Description of red square component node

interface RedSquareData {
  redSquareText: string
}

@Component({
  template: `
    <div class="red-square" (click)="onClick()">
      {{ node.data?.redSquareText }}

      <handle type="source" position="right"/>
    </div>
  `,
  styles: [`
    .red-square {
      width: 100px;
      height: 100px;
      background-color: #DE3163;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 5px;
      padding-right: 5px;
    }
  `],
  standalone: true,
  imports: [VflowModule]
})
export class RedSquareNodeComponent extends CustomNodeComponent<RedSquareData> {
  @Output()
  redSquareEvent = new EventEmitter<string>()

  onClick() {
    this.redSquareEvent.emit('Click from red square')
  }
}

// --- Description of blue square component node

interface BlueSquareData {
  blueSquareText: string
}

@Component({
  template: `
    <div class="blue-square" (click)="onClick()">
      {{ node.data?.blueSquareText }}

      <handle type="target" position="left"/>
    </div>
  `,
  styles: [`
    .blue-square {
      width: 100px;
      height: 100px;
      background-color: #0096FF;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 5px;
      padding-right: 5px;
    }
  `],
  standalone: true,
  imports: [VflowModule]
})
export class BlueSquareNodeComponent extends CustomNodeComponent<BlueSquareData> {
  @Output()
  blueSquareEvent = new EventEmitter<{ x: number, y: number }>()

  onClick() {
    this.blueSquareEvent.emit({ x: 5, y: 5 })
  }
}
