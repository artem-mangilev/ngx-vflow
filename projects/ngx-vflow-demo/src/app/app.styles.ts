import { Signal, computed, signal } from '@angular/core';
import { ContainerStyleSheet, RootStyleSheet, UISnapshot, hasClasses } from 'projects/ngx-vflow-lib/src/public-api';

export const styles = {
  root: () =>
    ({
      width: signal(200),
    }) satisfies RootStyleSheet,

  container: (snapshot: Signal<UISnapshot>) =>
    ({
      width: signal(180),
      borderRadius: signal(5),
      backgroundColor: signal('#1E1E1E'),
      marginTop: signal(5),
      marginBottom: signal(10),
      boxShadow: computed(() => {
        if (hasClasses(snapshot(), ':hover')) {
          return {
            hOffset: 3,
            vOffset: 5,
            blur: 3,
            color: 'rgb(255 0 0 / 0.4)',
          };
        }

        return null;
      }),
    }) satisfies ContainerStyleSheet,
};
