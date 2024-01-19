import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowModule, hasClasses, uuid } from 'projects/ngx-vflow-lib/src/public-api';

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
      position: { x: 10, y: 10 },
      type: 'custom',
    },
    {
      id: uuid(),
      position: { x: 100, y: 100 },
      type: 'custom'
    },
  ]

  public styles = { root, container }
}

const root: RootStyleSheetFn = () => ({
  width: signal(200)
})

const container: ContainerStyleSheetFn = (snapshot) => ({
  width: signal(180),
  borderRadius: signal(5),
  backgroundColor: signal('rgb(30 30 30)'),
  marginBottom: signal(10),
  boxShadow: computed(() => {
    if (hasClasses(snapshot(), ':hover')) {
      return {
        hOffset: 3,
        vOffset: 5,
        blur: 3,
        color: 'rgb(255 0 0 / 0.4)'
      }
    }

    return null
  })
})
