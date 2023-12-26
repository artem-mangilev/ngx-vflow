import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    borderRadius: 3,
    backgroundColor: '#FF0073',

    boxShadow: {
      hOffset: 3,
      vOffset: 5,
      blur: 3,
      color: 'rgb(255 255 255 / 0.4)'
    },

    onHover: {
      backgroundColor: '#FFFFFF'
    },

    onFocus: {
      backgroundColor: '#00FFFF'
    }
  } satisfies ContainerStyleSheet,
}
