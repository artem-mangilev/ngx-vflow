import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FF0073',

    boxShadow: {
      hOffset: 2,
      vOffset: 2,
      blur: 2,
      color: 'rgb(255 255 255 / 0.4)'
    },

    onHover: {
      borderWidth: 3,
    },

    onFocus: {
      backgroundColor: '#00FFFF'
    }
  } satisfies ContainerStyleSheet,
}
