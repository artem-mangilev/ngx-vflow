import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { HandleModel } from '../models/handle.model';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { SvgGraphicElementCacheService } from '../services/svg-graphic-element-cache.service';

@Directive({
  standalone: true,
  selector: '[handleSizeController]',
})
export class HandleSizeControllerDirective implements AfterViewInit, OnDestroy {
  public handleModel = input.required<HandleModel>({
    alias: 'handleSizeController',
  });

  private handleWrapper = inject(ElementRef) as ElementRef<SVGGElement>;
  private svgGraphicElementCacheService = inject(SvgGraphicElementCacheService);
  private animationFrameBtachingService = inject(RequestAnimationFrameBatchingService);

  public ngOnDestroy(): void {
    this.svgGraphicElementCacheService.removeElementCache(this.handleWrapper.nativeElement);
  }

  public ngAfterViewInit(): void {
    this.svgGraphicElementCacheService.addElementCache(this.handleWrapper.nativeElement);
    //inside animation frame callback otherwise we ngAfterViewInit calls in between each handle create
    this.animationFrameBtachingService.batchAnimationFrame(() => {
      const element = this.handleWrapper.nativeElement;
      const rect = this.svgGraphicElementCacheService.getElementData(element);
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
