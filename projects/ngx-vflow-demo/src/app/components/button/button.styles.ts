import { ContainerStyleSheet } from '../../../../../ngx-vflow-lib/src/public-api'

export const styles = {
  button: {
    height: 30,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FF0073',

    // animation: {
    //   property: 'borderRadius',
    //   from: 1,
    //   to: 10,
    //   duration: 1000
    // },

    onHover: {
      borderWidth: 3,

      // animation: {
      //   property: 'borderRadius',
      //   from: 1,
      //   to: 10,
      //   duration: 1000
      // },


      // boxShadow: {
      //   hOffset: 2,
      //   vOffset: 2,
      //   blur: 2,
      //   color: 'rgb(255 255 255 / 0.4)'
      // },
    },

    onFocus: {
      backgroundColor: '#00FFFF',

      animation: {
        property: 'borderRadius',
        from: 1,
        to: 10,
        duration: 1000
      },
    }
  } satisfies ContainerStyleSheet,
}
