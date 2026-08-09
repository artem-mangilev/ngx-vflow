import { ChangeDetectionStrategy, Component, input, output, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import type {
  ResizableComponent,
  ResizeControlDirection,
  ResizeParams,
  ResizeParamsWithDirection,
  ShouldResize,
} from 'ngx-vflow';
import { AsInterface } from '../types';

@Component({
  selector: '[resizable]',
  template: '<ng-content />',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableMockComponent implements AsInterface<ResizableComponent>, OnInit, OnDestroy, AfterViewInit {
  public resizable = input<boolean | ''>();
  public resizerColor = input('#2e414c');
  public gap = input(1.5);
  public minWidth = input<number>();
  public minHeight = input<number>();
  public maxWidth = input<number>();
  public maxHeight = input<number>();
  public keepAspectRatio = input(false);
  public resizeDirection = input<ResizeControlDirection>();
  public autoScale = input(true);
  public readonly resizeStart = output<ResizeParams>();
  public readonly resizeChange = output<ResizeParamsWithDirection>();
  public readonly resizeEnd = output<ResizeParams>();
  public shouldResize = input<ShouldResize>();

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnDestroy() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngAfterViewInit() {}
}
