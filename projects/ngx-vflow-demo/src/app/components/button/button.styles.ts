import { signal } from '@angular/core'
import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    height: signal(30),
    borderRadius: signal(1),
    borderWidth: signal(1),
    borderColor: signal('rgb(255, 255, 255)'),
    backgroundColor: signal('rgb(255, 0, 115)'),

    // onHover: {
    //   animation: [
    //     {
    //       property: 'borderWidth',
    //       from: 1,
    //       to: 3,
    //       duration: 200,
    //       animationFunction: 'ease'
    //     },
    //     {
    //       property: 'borderRadius',
    //       from: 1,
    //       to: 3,
    //       duration: 200,
    //       animationFunction: 'ease'
    //     },
    //     {
    //       property: 'borderColor',
    //       from: 'rgb(255, 255, 255)',
    //       to: 'rgb(255, 0, 115)',
    //       duration: 200,
    //       animationFunction: 'ease'
    //     },
    //     {
    //       property: 'backgroundColor',
    //       from: 'rgb(255, 0, 115)',
    //       to: 'rgb(0, 0, 0)',
    //       duration: 200,
    //       animationFunction: 'ease'
    //     },
    //   ],
    // },

    // onFocus: {
    //   backgroundColor: '#00FFFF',
    // },

    onClass: [
      ['active', {
        borderColor: signal('rgb(0, 0, 0)'),
      }]
    ]
  } satisfies ContainerStyleSheet,
}
