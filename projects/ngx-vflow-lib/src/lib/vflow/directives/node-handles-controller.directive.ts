import { DestroyRef, Directive, ElementRef, effect, inject, Injector } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { HandleModel } from '../models/handle.model';

@Directive({
  selector: '[nodeHandlesController]',
  standalone: true,
})
export class NodeHandlesControllerDirective {
  private readonly nodeAccessor = inject(NodeAccessorService);
  private readonly hostElementRef = inject<ElementRef<Element>>(ElementRef);
  private readonly resizeObserverService = inject(ResizeObserverService);
  private readonly requestAnimationFrameBatchingService = inject(RequestAnimationFrameBatchingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  constructor() {
    let previousHandles: HandleModel[] = [];
    let hostResizeTracked = false;

    effect(
      () => {
        const nodeModel = this.nodeAccessor.model();
        if (!nodeModel) {
          return;
        }

        const currentHandles = nodeModel.handles();
        const prevRefs = new Set(previousHandles.map((h) => h.hostReference));
        const currRefs = new Set(currentHandles.map((h) => h.hostReference));

        const handlesToRemove = previousHandles.filter((h) => !currRefs.has(h.hostReference));
        const handlesToAdd = currentHandles.filter((h) => !prevRefs.has(h.hostReference));

        for (const h of handlesToRemove) {
          this.resizeObserverService.removeObserver(h.hostReference);
        }

        if (currentHandles.length > 0 && !hostResizeTracked) {
          this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, () => {
            nodeModel.handles().forEach((handle) => handle.updateHost());
          });
          hostResizeTracked = true;
        }

        for (const handle of handlesToAdd) {
          this.resizeObserverService.addObserver(handle.hostReference, () => {
            nodeModel.handles().forEach((h) => h.updateHost());
          });
        }

        // After removal the detached handle can still affect layout reads in the same frame; defer
        // a full refresh. Pure adds are covered by HandleComponent's batched updateHost.
        if (handlesToRemove.length > 0) {
          this.requestAnimationFrameBatchingService.batchAnimationFrame(() => {
            nodeModel.handles().forEach((handle) => handle.updateHost());
          });
        }

        previousHandles = currentHandles;
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => {
      const nodeModel = this.nodeAccessor.model();
      this.resizeObserverService.removeObserver(this.hostElementRef.nativeElement);
      if (nodeModel) {
        for (const h of nodeModel.handles()) {
          this.resizeObserverService.removeObserver(h.hostReference);
        }
      }
    });
  }
}
