import { ChangeDetectionStrategy, Component, input, TemplateRef, OnInit } from '@angular/core';
import type { HandleComponent, Position } from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: 'handle',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HandleMockComponent implements AsInterface<HandleComponent>, OnInit {
  public position = input.required<Position>();
  public type = input.required<'source' | 'target'>();
  public id = input<string>();
  public template = input<TemplateRef<any> | null>();
  public offsetX = input<number>(0);
  public offsetY = input<number>(0);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit(): void {}
}
