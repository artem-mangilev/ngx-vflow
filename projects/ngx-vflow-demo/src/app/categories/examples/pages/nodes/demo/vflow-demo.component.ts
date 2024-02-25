import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit, ViewChild, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowComponent, VflowModule, hasClasses, uuid } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-demo.component.html',
  styleUrls: ['./vflow-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, VDocModule]
})
export class VflowDemoComponent {
  public nodes: Node[] = [
    {
      id: uuid(),
      point: { x: 10, y: 10 },
      type: 'default',
      text: '1'
    },
    {
      id: uuid(),
      point: { x: 100, y: 100 },
      type: 'default',
      text: '2'
    },
  ]
}
