import { DestroyRef, Directive, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { resizable } from '../utils/resizable';
import { NodeAccessorService } from '../services/node-accessor.service';
import { filter, startWith, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

    resizable([this.hostElementRef.nativeElement], this.zone)
      .pipe(
        startWith(null),
        filter(() => !model.resizing()),
        tap(() => {
          const width = this.hostElementRef.nativeElement.clientWidth;
          const height = this.hostElementRef.nativeElement.clientHeight;

          model.width.set(width);
          model.height.set(height);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
