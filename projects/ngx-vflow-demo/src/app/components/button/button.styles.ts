import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    height: 30,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FF0073',

    onHover: {
      borderWidth: 3,

      animation: {
        property: 'borderRadius',
        from: 1,
        to: 10,
        duration: 200
      },
    },

    onFocus: {
      backgroundColor: '#00FFFF',
    }
  } satisfies ContainerStyleSheet,
}
