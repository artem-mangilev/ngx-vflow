import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FF0073',

    // boxShadow: {
    //   hOffset: 3,
    //   vOffset: 3,
    //   blur: 1,
    //   color: 'rgb(255 255 255)'
    // },

    onHover: {
      borderWidth: 3,

      boxShadow: {
        hOffset: 2,
        vOffset: 2,
        blur: 2,
        color: 'rgb(255 255 255 / 0.4)'
      }
    },

    onFocus: {
      backgroundColor: '#00FFFF'
    }
  } satisfies ContainerStyleSheet,
}
