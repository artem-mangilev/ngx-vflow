import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConnectionSettings, Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connectionSettings" />`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class CurvesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 30, y: 100 },
      type: 'default',
      text: '1'
    },
    {
      id: '2',
      point: { x: 220, y: 0 },
      type: 'default',
      text: '2'
    },
    {
      id: '3',
      point: { x: 220, y: 200 },
      type: 'default',
      text: '3'
    },
    {
      id: '4',
      point: { x: 30, y: 300 },
      type: 'default',
      text: '4'
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: 'bezier'
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: 'straight'
    },
    {
      id: '1 -> 4',
      source: '1',
      target: '4',
      curve: 'smooth-step'
    },
  ]

  public connectionSettings: ConnectionSettings = {
    curve: 'smooth-step'
  }
}

