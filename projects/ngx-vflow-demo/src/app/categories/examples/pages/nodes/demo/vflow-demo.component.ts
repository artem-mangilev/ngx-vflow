import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit, ViewChild, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowComponent, VflowModule, hasClasses, uuid } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-demo.component.html',
  styleUrls: ['./vflow-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, VDocModule]
})
export class VflowDemoComponent implements AfterViewInit {
  public nodes: Node[] = [
    {
      id: uuid(),
      point: { x: 10, y: 10 },
      type: 'custom',
    },
    {
      id: uuid(),
      point: { x: 100, y: 100 },
      type: 'custom'
    },
  ]

  public styles = { root, container }

  @ViewChild('vflow')
  public flow!: VflowComponent

  public ngAfterViewInit(): void {
    // this.flow.panTo(0, 0)

    // this.flow.zoomPan$.subscribe(val => {
    //   console.log(val)
    // })
  }
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
