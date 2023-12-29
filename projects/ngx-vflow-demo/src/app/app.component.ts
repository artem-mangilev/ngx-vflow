import { ChangeDetectionStrategy, Component } from '@angular/core';
import { styles } from './app.styles';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected styles = styles;
}
