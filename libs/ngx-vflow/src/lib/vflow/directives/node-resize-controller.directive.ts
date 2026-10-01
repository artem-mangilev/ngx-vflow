import { Directive, ElementRef, effect, inject, OnDestroy, OnInit, untracked } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { AfterRenderBatchService } from '../services/after-render-batch.service';

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
  private afterRenderBatch = inject(AfterRenderBatchService);
  private resizeCallback: ((resizeEntry: ResizeObserverEntry) => void) | null = null;
  private destroyed = false;
  private readonly measureAfterRender = () => this.measure();

  constructor() {
    effect(() => {
      const model = this.nodeAccessor.model();
      // Reading resizing() re-runs the measurement when a gesture ends, reconciling the size the resizer wrote
      // with the size the browser rendered (CSS min/max can clamp it).
      if (model && !model.resizing() && !model.culled()) {
        untracked(() => this.afterRenderBatch.read(this.measureAfterRender));
      }
    });
  }

  private measure(): void {
    if (this.destroyed) return;
    const model = this.nodeAccessor.model();
    const target = this.hostElementRef.nativeElement;
    // During a gesture the resizer owns the size: writing a clamped DOM size would make the next move oscillate.
    if (!model || model.culled() || model.resizing()) return;
    // display:none notifications must not overwrite cached geometry with zeros.
    const hasBox = target.getClientRects().length > 0;
    model.hasBox.set(hasBox);
    if (!hasBox) return;
    // Measure the layout box, excluding protruding ports and external labels.
    // scrollWidth/Height would feed their overflow back into the next edge geometry pass.
    // Only the rendered size is written: the explicit size belongs to the application and the resizer.
    model.width.set(target.offsetWidth);
    model.height.set(target.offsetHeight);
    model.isMeasured.set(true);
    model.hasMeasurement.set(true);
  }

  public ngOnInit(): void {
    this.resizeCallback = () => this.measure();
    this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, this.resizeCallback);
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    if (this.resizeCallback) {
      this.resizeObserverService.removeObserver(this.hostElementRef.nativeElement, this.resizeCallback);
    }
  }
}
