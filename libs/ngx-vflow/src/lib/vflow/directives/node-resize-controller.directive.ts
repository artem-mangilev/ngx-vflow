import { afterRenderEffect, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { ResizeObserverService } from '../services/resize-observer.service';

/** Measures the layout surface of HTML nodes, excluding decorative overflow. */
@Directive({
  selector: '[nodeResizeController]',
  standalone: true,
})
export class NodeResizeControllerDirective implements OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private resizeObserverService = inject(ResizeObserverService);
  private hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private observedElement: HTMLElement | null = null;
  private readonly resizeCallback = () => this.measure();

  constructor() {
    afterRenderEffect(() => {
      const model = this.nodeAccessor.model();
      const target = this.nodeAccessor.resizerHost() ?? this.hostElementRef.nativeElement;
      if (target !== this.observedElement) {
        if (this.observedElement) {
          this.resizeObserverService.removeObserver(this.observedElement, this.resizeCallback);
        }
        this.observedElement = target;
        this.resizeObserverService.addObserver(target, this.resizeCallback);
      }
      if (!model?.culled()) this.measure();
    });
  }

  private measure(): void {
    const model = this.nodeAccessor.model();
    // A resizable node's wrapper is sized from the model. Measuring that wrapper
    // would miss CSS constraints that make the actual surface larger or smaller.
    const target = this.nodeAccessor.resizerHost() ?? this.hostElementRef.nativeElement;
    if (!model || model.culled() || !target.getClientRects().length) return;
    // Border-box layout dimensions exclude protruding ports and external labels.
    model.width.set(target.offsetWidth);
    model.height.set(target.offsetHeight);
    model.isMeasured.set(true);
  }

  public ngOnDestroy(): void {
    if (this.observedElement) {
      this.resizeObserverService.removeObserver(this.observedElement, this.resizeCallback);
    }
  }
}
