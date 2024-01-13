import { ChangeDetectionStrategy, Component, Signal, computed, signal } from '@angular/core';
import { ContainerStyleSheet, RootStyleSheet, UISnapshot, VDocModule, hasClasses } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vdoc-demo.component.html',
  styleUrls: ['./vdoc-demo.styles.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VDocModule]
})
export class VdocDemoComponent {
  protected styles = styles
}

const styles = {
  root: () => ({
    width: signal(200)
  } satisfies RootStyleSheet),

  container: (snapshot: Signal<UISnapshot>) => ({
    width: signal(180),
    borderRadius: signal(5),
    backgroundColor: signal('rgb(30 30 30)'),
    marginBottom: signal(10),
    boxShadow: computed(() => {
      if (hasClasses(snapshot(), ':hover')) {
        return {
          hOffset: 3,
          vOffset: 5,
          blur: 3,
          color: 'rgb(255 0 0 / 0.4)'
        }
      }

      return null
    })
  } satisfies ContainerStyleSheet),

}
