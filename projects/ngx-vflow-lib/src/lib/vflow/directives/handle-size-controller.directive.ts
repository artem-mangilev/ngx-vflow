import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { HandleModel } from '../models/handle.model';
import { ElementCacheService } from '../services/element-cache.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';

@Directive({
  standalone: true,
  selector: '[handleSizeController]',
})
export class HandleSizeControllerDirective implements AfterViewInit, OnDestroy {
  public handleModel = input.required<HandleModel>({
    alias: 'handleSizeController',
  });

  private handleWrapper = inject(ElementRef) as ElementRef<SVGGElement>;
  private elementCacheService = inject(ElementCacheService);
  private animationFrameBtachingService = inject(RequestAnimationFrameBatchingService);

  public ngOnDestroy(): void {
    this.elementCacheService.removeElementCache({
      element: this.handleWrapper.nativeElement,
      type: 'svgGraphicElement',
    });
  }

  public ngAfterViewInit(): void {
    this.elementCacheService.addElementCache({ element: this.handleWrapper.nativeElement, type: 'svgGraphicElement' });
    //inside animation frame callback otherwise we ngAfterViewInit calls in between each handle create
    this.animationFrameBtachingService.batchAnimationFrame(() => {
      const element = this.handleWrapper.nativeElement;
      let rect = this.elementCacheService.getElementData({
        element: element,
        type: 'svgGraphicElement',
      })?.rect;
      if (rect === undefined) {
        //We should never get here but in case we do, we fallback to forcing a reflow of the layout
        rect = element.getBBox();
      }

      const stroke = getChildStrokeWidth(element);
      this.handleModel().size.set({
        width: rect.width + stroke,
        height: rect.height + stroke,
      });
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
