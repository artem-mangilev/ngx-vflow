import { Signal, computed, signal } from '@angular/core'
import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'
import { UISnapshot } from 'projects/ngx-vflow-lib/src/lib/vdoc/utils/ui-change'

export const styles = {
  button: (snapshot: Signal<UISnapshot>) => ({
    height: signal(30),
    borderRadius: computed(() => snapshot().classes.has(':hover') ? 5 : 1),
    borderWidth: signal(1),

    borderColor: computed(() => {
      console.log('border')

      if (snapshot().classes.has('active') && snapshot().classes.has(':hover')) {
        return 'rgb(255, 255, 0)'
      } else if (snapshot().classes.has('active')) {
        return 'rgb(255, 255, 255)'
      }

      return 'rgb(0, 255, 255)'
    }),

    backgroundColor: computed(() =>
      snapshot().classes.has(':hover') ? 'rgb(0, 0, 0)' : 'rgb(255, 0, 115)'
    ),

    // TODO fix animatios
    animation: {
      ':hover': [
        {
          property: 'borderWidth',
          from: 1,
          to: 3,
          duration: 200,
          animationFunction: 'ease'
        },
        // {
        //   property: 'borderRadius',
        //   from: 1,
        //   to: 3,
        //   duration: 200,
        //   animationFunction: 'ease'
        // },
        // {
        //   property: 'borderColor',
        //   from: 'rgb(255, 255, 255)',
        //   to: 'rgb(255, 0, 115)',
        //   duration: 200,
        //   animationFunction: 'ease'
        // },
        // {
        //   property: 'backgroundColor',
        //   from: 'rgb(255, 0, 115)',
        //   to: 'rgb(0, 0, 0)',
        //   duration: 200,
        //   animationFunction: 'ease'
        // },
      ]
    }
  } satisfies ContainerStyleSheet),
}
