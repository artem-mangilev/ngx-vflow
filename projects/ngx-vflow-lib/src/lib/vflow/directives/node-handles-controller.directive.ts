import { DestroyRef, Directive, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NodeBatchingResizeService } from '../services/node-batching-resize.service';
import { OffsetBatchingCacheService } from '../services/offset-batching-cache.service';

@Directive({
  selector: '[nodeHandlesController]',
  standalone: true,
})
export class NodeHandlesControllerDirective implements OnInit {
  private nodeAccessor = inject(NodeAccessorService);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private hostElementRef = inject<ElementRef<Element>>(ElementRef);
  private nodeResizeService = inject(NodeBatchingResizeService);
  private offsetBatchingService = inject(OffsetBatchingCacheService);

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    model.handles$
      .pipe(
        map((handles) => {
          handles.map((h) => this.nodeResizeService.addObserver(h.hostReference, () => {}));

          this.nodeResizeService.addObserver(this.hostElementRef.nativeElement, () => {});
          return handles;
        }),
        tap((handles) => {
          this.offsetBatchingService.cacheIsDirty();
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
          handles.forEach((h) => h.updateHost());
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
