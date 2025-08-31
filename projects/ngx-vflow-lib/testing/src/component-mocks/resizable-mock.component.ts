import { ChangeDetectionStrategy, Component, input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import type { ResizableComponent } from 'ngx-vflow';
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

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnDestroy() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngAfterViewInit() {}
}
