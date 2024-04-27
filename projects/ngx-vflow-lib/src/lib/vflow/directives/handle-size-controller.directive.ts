import { AfterViewInit, Directive, ElementRef, Input, inject } from '@angular/core';
import { HandleModel } from '../models/handle.model';

@Directive({ selector: '[handleSizeController]' })
export class HandleSizeControllerDirective implements AfterViewInit {
  @Input({ required: true, alias: 'handleSizeController' })
  public handleModel!: HandleModel

  private handleWrapper = inject(ElementRef) as ElementRef<SVGGElement>

  public ngAfterViewInit(): void {
    const element = this.handleWrapper.nativeElement
    const rect = element.getBBox()

    const stroke = getChildStrokeWidth(element)
    this.handleModel.size.set({
      width: rect.width + stroke,
      height: rect.height + stroke
    })
  }
}

function getChildStrokeWidth(element: SVGGElement) {
  const child = element.firstElementChild

  if (child) {
    const stroke = getComputedStyle(child).strokeWidth
    const strokeAsNumber = Number(stroke.replace('px', ''))

    if (isNaN(strokeAsNumber)) {
      return 0
    }

    return strokeAsNumber
  }

  return 0
}
