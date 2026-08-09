import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
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
  private hostElementRef = inject<ElementRef<Element>>(ElementRef);
  private resizeCallback: ((resizeEntry: ResizeObserverEntry) => void) | null = null;

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    this.resizeCallback = (resizeEntry) => {
      const target = resizeEntry.target;
      // Use scroll size (overflow-aware) so a node whose content is larger than the
      // box it is constrained to (e.g. a resizable wrapper clamped to the model size,
      // with content imposing a bigger min-width/min-height) is still measured at its
      // real rendered size. Without resizer, content fits and scroll size == client size.
      model.width.set(target.scrollWidth);
      model.height.set(target.scrollHeight);
      model.isMeasured.set(true);
    };
    this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, this.resizeCallback);
  }

  public ngOnDestroy(): void {
    if (this.resizeCallback) {
      this.resizeObserverService.removeObserver(this.hostElementRef.nativeElement, this.resizeCallback);
    }
  }
}
