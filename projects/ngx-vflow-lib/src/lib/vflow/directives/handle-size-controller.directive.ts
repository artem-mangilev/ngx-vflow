import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { HandleModel } from '../models/handle.model';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';

@Directive({
  standalone: true,
  selector: '[handleSizeController]',
})
export class HandleSizeControllerDirective implements AfterViewInit {
  public handleModel = input.required<HandleModel>({
    alias: 'handleSizeController',
  });

  private handleWrapper = inject(ElementRef) as ElementRef<HTMLElement>;
  private animationFrameBtachingService = inject(RequestAnimationFrameBatchingService);

  public ngAfterViewInit(): void {
    //inside animation frame callback otherwise we ngAfterViewInit calls in between each handle create
    this.animationFrameBtachingService.batchAnimationFrame(() => {
      const element = this.handleWrapper.nativeElement;
      this.handleModel().size.set({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    });
  }
}
