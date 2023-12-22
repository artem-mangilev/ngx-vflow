import { ChangeDetectionStrategy, Component, Type, forwardRef } from '@angular/core';
import { styles } from './button.styles';
import { VDocComponent, provideComponent } from '../../../../../ngx-vflow-lib/src/public-api'

@Component({
  selector: '[app-button]',
  template: `
    <svg:svg vdoc-container [styleSheet]="styles.button">
      <svg:foreignObject vdoc-html>
        <div style="height: 40px; display: flex; justify-content: center; align-items: center;">Нажать!</div>
      </svg:foreignObject>
    </svg:svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(ButtonComponent)]
})
export class ButtonComponent extends VDocComponent {
  protected styles = styles
}
