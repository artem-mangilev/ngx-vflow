import { Component, input } from '@angular/core';

@Component({
  selector: 'default-node',
  templateUrl: './default-node.component.html',
  styleUrls: [`./default-node.component.scss`],
  host: {
    '[class.selected]': 'selected()',
  },
})
export class DefaultNodeComponent {
  public selected = input(false);
}
