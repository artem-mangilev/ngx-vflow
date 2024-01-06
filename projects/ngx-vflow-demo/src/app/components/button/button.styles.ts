import { Signal, computed, signal } from '@angular/core'
import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'
import { UISnapshot } from 'projects/ngx-vflow-lib/src/lib/vdoc/utils/class-change'

export const styles = {
  button: (snapshot: Signal<UISnapshot>) => ({
    height: signal(30),
    borderRadius: computed(() => snapshot().classes.has(':hover') ? 5 : 1),
    borderWidth: signal(1),
    borderColor: computed(() =>
      snapshot().classes.has('active') ? 'rgb(255, 255, 255)' : 'rgb(0, 255, 255)'
    ),
    backgroundColor: computed(() =>
      snapshot().classes.has(':hover') ? 'rgb(0, 0, 0)' : 'rgb(255, 0, 115)'
    ),

    // TODO fix animatios
    animation: computed(() => {
      if (snapshot().classes.has(':hover')) {
        return [
          {
            property: 'borderWidth',
            from: 1,
            to: 3,
            duration: 200,
            animationFunction: 'ease'
          },
          {
            property: 'borderRadius',
            from: 1,
            to: 3,
            duration: 200,
            animationFunction: 'ease'
          },
          {
            property: 'borderColor',
            from: 'rgb(255, 255, 255)',
            to: 'rgb(255, 0, 115)',
            duration: 200,
            animationFunction: 'ease'
          },
          {
            property: 'backgroundColor',
            from: 'rgb(255, 0, 115)',
            to: 'rgb(0, 0, 0)',
            duration: 200,
            animationFunction: 'ease'
          },
        ]
      }

      return []
    })
  } satisfies ContainerStyleSheet),
}
