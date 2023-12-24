import { ContainerStyleSheet, HtmlStyleSheet, ImageStyleSheet, RootStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  root: {
    width: 200
  } satisfies RootStyleSheet,

  container: {
    borderRadius: 5,
    backgroundColor: '#1E1E1E',
    marginTop: 5,
    marginBottom: 10
  } satisfies ContainerStyleSheet,
}
