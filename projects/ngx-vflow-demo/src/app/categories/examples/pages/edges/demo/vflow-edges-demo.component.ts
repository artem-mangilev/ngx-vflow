import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit, ViewChild, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Position } from 'projects/ngx-vflow-lib/src/lib/vflow/enums/position.enum';
import { Edge } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/edge.interface';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowComponent, VflowModule, hasClasses, uuid } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-edges-demo.component.html',
  styleUrls: ['./vflow-edges-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, VDocModule]
})
export class VflowEdgesDemoComponent {
  public nodes: Node[] = [
    {
      id: uuid(),
      point: { x: 10, y: 10 },
      type: 'default',
    },
    {
      id: uuid(),
      point: { x: 100, y: 100 },
      type: 'default',
    },
  ]

  public edges: Edge[] = [
    {
      id: uuid(),
      source: this.nodes[0].id,
      target: this.nodes[1].id
    }
  ]
}
