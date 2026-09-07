import { afterRenderEffect, Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { ResizeObserverService } from '../services/resize-observer.service';

/**
 * Only suitable for HTML nodes
 */
@Directive({
  selector: '[nodeResizeController]',
  standalone: true,
})
export class NodeResizeControllerDirective implements OnInit, OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private resizeObserverService = inject(ResizeObserverService);
  private hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private resizeCallback: ((resizeEntry: ResizeObserverEntry) => void) | null = null;

  constructor() {
    afterRenderEffect(() => {
      if (!this.nodeAccessor.model()?.culled()) this.measure();
    });
  }

  private measure(): void {
    const model = this.nodeAccessor.model();
    const target = this.hostElementRef.nativeElement;
    // display:none notifications must not overwrite cached geometry with zeros.
    if (!model || model.culled() || !target.getClientRects().length) return;
    // Measure the layout box, excluding protruding ports and external labels.
    // scrollWidth/Height would feed their overflow back into the next edge geometry pass.
    model.width.set(target.offsetWidth);
    model.height.set(target.offsetHeight);
    model.isMeasured.set(true);
  }

  public ngOnInit(): void {
    this.resizeCallback = () => this.measure();
    this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, this.resizeCallback);
  }

  public ngOnDestroy(): void {
    if (this.resizeCallback) {
      this.resizeObserverService.removeObserver(this.hostElementRef.nativeElement, this.resizeCallback);
    }
  }
}
