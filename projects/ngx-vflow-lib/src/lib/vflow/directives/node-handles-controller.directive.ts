import { DestroyRef, Directive, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { resizable } from '../utils/resizable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[nodeHandlesController]',
  standalone: true,
})
export class NodeHandlesControllerDirective implements OnInit {
  private nodeAccessor = inject(NodeAccessorService);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private hostElementRef = inject<ElementRef<Element>>(ElementRef);

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    model.handles$
      .pipe(
        switchMap((handles) =>
          resizable([...handles.map((h) => h.hostReference!), this.hostElementRef.nativeElement], this.zone).pipe(
            map(() => handles),
          ),
        ),
        tap((handles) => {
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
          handles.forEach((h) => h.updateHost());
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
