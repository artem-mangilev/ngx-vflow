import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { HandleModel } from '../models/handle.model';

@Directive({ selector: '[handleSizeController]' })
export class HandleSizeControllerDirective implements AfterViewInit {
  public handleModel = input.required<HandleModel>({
    alias: 'handleSizeController',
  });

  private handleWrapper = inject(ElementRef) as ElementRef<SVGGElement>;

  public ngAfterViewInit(): void {
    const element = this.handleWrapper.nativeElement;
    const rect = element.getBBox();

    const stroke = getChildStrokeWidth(element);
    this.handleModel().size.set({
      width: rect.width + stroke,
      height: rect.height + stroke,
    });
  }
}

function getChildStrokeWidth(element: SVGGElement) {
  const child = element.firstElementChild;

  if (child) {
    const stroke = getComputedStyle(child).strokeWidth;
    const strokeAsNumber = Number(stroke.replace('px', ''));

    if (isNaN(strokeAsNumber)) {
      return 0;
    }

    return strokeAsNumber;
  }

  return 0;
}
