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
    width: 80,
    borderRadius: 5,
    backgroundColor: '#0000ff',
    marginLeft: 10,
    // marginRight: 'auto',
    marginTop: 10,
    marginBottom: 10
  } satisfies ContainerStyleSheet,

  image: {
    width: 40,
    height: 40,
    marginLeft: 'auto',
    marginRight: 'auto'
  } satisfies ImageStyleSheet,

  htmlContainer: {
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

  button: {
    width: 100,
    height: 40,
    borderRadius: 5,
    borderColor: '#000000',
    borderWidth: 2,
    backgroundColor: '#e74c3c',
  } satisfies ContainerStyleSheet
}
