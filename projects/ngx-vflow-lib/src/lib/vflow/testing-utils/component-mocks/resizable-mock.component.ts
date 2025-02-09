import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: '[resizable]',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableMockComponent {
  public resizable = input<boolean | ''>();
  public resizerColor = input('#2e414c');
  public gap = input(1.5);
}
