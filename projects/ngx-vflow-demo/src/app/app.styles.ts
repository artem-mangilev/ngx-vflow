import { BlockStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  container: {
    width: 200,
    height: 50,
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
