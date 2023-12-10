import { BlockStyleSheet, RootStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  root: {
    width: 200
  } satisfies RootStyleSheet,

  container: {
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    marginBottom: 10
  } satisfies BlockStyleSheet,

  innerContainer: {
    width: 100,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#0000ff',
    marginBottom: 10
  } satisfies BlockStyleSheet
}
