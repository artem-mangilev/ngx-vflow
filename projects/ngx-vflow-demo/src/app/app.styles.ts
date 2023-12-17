import { ContainerStyleSheet, ImageStyleSheet, RootStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  root: {
    width: 200
  } satisfies RootStyleSheet,

  container: {
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    marginTop: 5,
    marginBottom: 10
  } satisfies ContainerStyleSheet,

  resizableContainer: {
    // height: 40,
    borderRadius: 5,
    backgroundColor: '#0000ff',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10
  } satisfies ContainerStyleSheet,

  emptyContainer: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#0000ff',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10
  } satisfies ContainerStyleSheet,

  image: {
    height: 40
  } satisfies ImageStyleSheet
}
