import { signal } from "@angular/core";
import { ContainerStyleSheet, RootStyleSheet } from "projects/ngx-vflow-lib/src/public-api";

export const styles = {
  root: () => ({
    width: signal(200)
  } satisfies RootStyleSheet),

  container: () => ({
    width: signal(180),
    borderRadius: signal(5),
    backgroundColor: signal('#1E1E1E'),
    marginTop: signal(5),
    marginBottom: signal(10),
    boxShadow: signal({
      hOffset: 3,
      vOffset: 5,
      blur: 3,
      color: 'rgb(255 0 0 / 0.4)'
    })
  } satisfies ContainerStyleSheet),
}
