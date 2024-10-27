import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'default-node',
  templateUrl: './default-node.component.html',
  styleUrls: [`./default-node.component.scss`],
  host: {
    '[class.selected]': 'selected'
  }
})
export class DefaultNodeComponent {
  @Input()
  public selected = false
}
