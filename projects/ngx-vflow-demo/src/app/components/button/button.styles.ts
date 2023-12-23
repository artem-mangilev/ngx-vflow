import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    width: 100,
    height: 40,
    borderRadius: 3,
    borderColor: '#000000',
    borderWidth: 2,
    backgroundColor: '#e74c3c',

    onHover: {
      borderColor: '#ff0000',
      backgroundColor: '#ffffff'
    }
  } satisfies ContainerStyleSheet,
}
