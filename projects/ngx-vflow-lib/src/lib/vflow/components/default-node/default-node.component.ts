import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'default-node',
  templateUrl: './default-node.component.html',
  styleUrls: [`./default-node.component.scss`],
  host: {
    '[class.selected]': 'selected()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultNodeComponent {
  public selected = input(false);
}
