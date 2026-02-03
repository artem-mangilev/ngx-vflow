import { DestroyRef, Directive, ElementRef, inject, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { pairwise, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeObserverService } from '../services/resize-observer.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';

@Directive({
  selector: '[nodeHandlesController]',
  standalone: true,
})
export class NodeHandlesControllerDirective implements OnInit {
  private nodeAccessor = inject(NodeAccessorService);
  private destroyRef = inject(DestroyRef);
  private hostElementRef = inject<ElementRef<Element>>(ElementRef);
  private resizeObserverService = inject(ResizeObserverService);
  private requestAnimationFrameBatchingService = inject(RequestAnimationFrameBatchingService);

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    let isTrackingHostElement = false;

    model.handles$
      .pipe(
        pairwise(),
        tap(([previousHandles, currentHandles]) => {
          const handlesToRemove = previousHandles.filter(
            (prev) => currentHandles.find((curr) => curr.hostReference === prev.hostReference) === undefined,
          );
          handlesToRemove.forEach((h) => this.resizeObserverService.removeObserver(h.hostReference));

          const handlesToAdd = currentHandles.filter(
            (curr) => previousHandles.find((prev) => curr.hostReference === prev.hostReference) === undefined,
          );

          if (!isTrackingHostElement) {
            this.resizeObserverService.addObserver(this.hostElementRef.nativeElement, () => {
              currentHandles.forEach((h) => h.updateHost());
            });
            isTrackingHostElement = true;
          }

          handlesToAdd.forEach((h) =>
            this.resizeObserverService.addObserver(h.hostReference, () => {
              currentHandles.forEach((h) => h.updateHost());
            }),
          );

          //Here we need this to be in a requestAnimationFrame otherwise the handle can still be present in the dom which throws off the offset cache
          this.requestAnimationFrameBatchingService.batchAnimationFrame(() => {
            currentHandles.forEach((h) => h.updateHost());
          });
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
