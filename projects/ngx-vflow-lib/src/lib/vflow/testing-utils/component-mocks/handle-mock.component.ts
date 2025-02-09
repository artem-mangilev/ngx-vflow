import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { Position } from '../../types/position.type';

@Component({
  selector: 'handle',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HandleMockComponent {
  public position = input.required<Position>();
  public type = input.required<'source' | 'target'>();
  public id = input<string>();
  public template = input<TemplateRef<any>>();
}
