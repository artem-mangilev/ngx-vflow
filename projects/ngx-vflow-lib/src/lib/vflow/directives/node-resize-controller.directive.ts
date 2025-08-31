import { DestroyRef, Directive, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { resizable } from '../utils/resizable';
import { NodeAccessorService } from '../services/node-accessor.service';
import { filter, merge, startWith, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Only suitable for HTML nodes
 */
@Directive({
  selector: '[nodeResizeController]',
  standalone: true,
})
export class NodeResizeControllerDirective implements OnInit {
  private nodeAccessor = inject(NodeAccessorService);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private hostElementRef = inject<ElementRef<Element>>(ElementRef);

  public ngOnInit(): void {
    const model = this.nodeAccessor.model()!;

    const host = this.hostElementRef.nativeElement;

    merge(resizable([host], this.zone))
      .pipe(
        startWith(null),
        filter(() => !model.resizing()),
        tap(() => {
          model.width.set(host.clientWidth);
          model.height.set(host.clientHeight);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
