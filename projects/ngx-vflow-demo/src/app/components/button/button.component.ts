import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { styles } from './button.styles';
import { VDocComponent, provideComponent } from '../../../../../ngx-vflow-lib/src/public-api'

@Component({
  selector: '[app-button]',
  template: `
    <svg:svg vdoc-container [class.active]="active" [styleSheet]="styles.button">
      <svg:foreignObject vdoc-html (click)="onClick()">
        <div class="button-content">{{ text }}</div>
      </svg:foreignObject>
    </svg:svg>
  `,
  styles: [`
    .button-content {
      height: 30px;
      user-select: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font: 0.8rem "Fira Sans", sans-serif;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(ButtonComponent)]
})
export class ButtonComponent extends VDocComponent {
  @Input()
  public text = ''

  protected styles = styles

  protected active = true

  protected onClick() {
    this.active = !this.active
  }
}
