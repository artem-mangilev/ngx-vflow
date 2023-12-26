import { ContainerStyleSheet, RootStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  root: {
    width: 200
  } satisfies RootStyleSheet,

  container: {
    width: 180,
    borderRadius: 5,
    backgroundColor: '#1E1E1E',
    marginTop: 5,
    marginBottom: 10,
    boxShadow: {
      hOffset: 3,
      vOffset: 5,
      blur: 3,
      color: 'rgb(255 0 0 / 0.4)'
    }
  } satisfies ContainerStyleSheet,
}
