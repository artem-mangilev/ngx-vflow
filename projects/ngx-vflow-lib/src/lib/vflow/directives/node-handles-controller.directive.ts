import { DestroyRef, Directive, ElementRef, inject, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeObserverService } from '../services/resize-observer.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';

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
  private observedElements = new Set<Element>();
  private model: NodeModel | null = null;
  private syncScheduled = false;
  private destroyed = false;
  private readonly resizeCallback = () => this.scheduleSync();

  public ngOnInit(): void {
    this.model = this.nodeAccessor.model()!;

    this.model.handles$
      .pipe(
        tap((handles) => {
          this.updateObservedElements(handles);
          this.scheduleSync();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.observedElements.forEach((element) =>
        this.resizeObserverService.removeObserver(element, this.resizeCallback),
      );
      this.observedElements.clear();
    });
  }

  private updateObservedElements(handles: HandleModel[]): void {
    const nextElements = new Set<Element>([this.hostElementRef.nativeElement]);

    handles.forEach((handle) => {
      if (handle.isStandard) {
        return;
      }

      nextElements.add(handle.hostReference);
      if (handle.handleElement) {
        nextElements.add(handle.handleElement);
      }
    });

    this.observedElements.forEach((element) => {
      if (!nextElements.has(element)) {
        this.resizeObserverService.removeObserver(element, this.resizeCallback);
        this.observedElements.delete(element);
      }
    });

    nextElements.forEach((element) => {
      if (!this.observedElements.has(element)) {
        this.resizeObserverService.addObserver(element, this.resizeCallback);
        this.observedElements.add(element);
      }
    });
  }

  private scheduleSync(): void {
    if (this.syncScheduled || this.destroyed || !this.model?.handles().length) {
      return;
    }

    this.syncScheduled = true;
    this.requestAnimationFrameBatchingService.batchAnimationFrame(() => {
      this.syncScheduled = false;

      if (this.destroyed || !this.model) {
        return;
      }

      const handles = this.model.handles();
      const nodeRect = handles.some((handle) => !handle.isStandard)
        ? this.model.nodeElement()?.getBoundingClientRect()
        : undefined;
      const measurements = handles.map((handle) => handle.measure(nodeRect));

      handles.forEach((handle, index) => handle.applyGeometry(measurements[index]));
    });
  }
}
