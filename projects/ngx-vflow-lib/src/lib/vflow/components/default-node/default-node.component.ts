import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'default-node',
  templateUrl: './default-node.component.html',
  styleUrls: [`./default-node.component.scss`],
  host: {
    '[class.selected]': 'selected()',
    '[class.preselected]': 'preselected()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent {
  public selected = input(false);
  public preselected = input(false);
}
