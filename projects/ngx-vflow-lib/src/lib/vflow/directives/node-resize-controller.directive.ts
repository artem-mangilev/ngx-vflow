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

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, (resizeEntry) => {
      model.width.set(resizeEntry.target.clientWidth);
      model.height.set(resizeEntry.target.clientHeight);
    });
  }

  public ngOnDestroy(): void {
    this.resizeObserverService.removeObserver(this.hostElementRef.nativeElement);
  }
}
