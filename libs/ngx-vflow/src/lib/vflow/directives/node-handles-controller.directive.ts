import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject, OnInit } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeObserverService } from '../services/resize-observer.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { NodeModel } from '../models/node.model';
import { createHandleMeasureContext, HandleModel } from '../models/handle.model';
import { ViewportService } from '../services/viewport.service';

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
  private viewportService = inject(ViewportService);
  private observedElements = new Set<Element>();
  private model: NodeModel | null = null;
  private syncScheduled = false;
  private destroyed = false;
  private readonly resizeCallback = () => this.scheduleSync();

  constructor() {
    afterRenderEffect(() => {
      const model = this.nodeAccessor.model();
      if (!model) return;

      // Changing a handle's side, offset or layout moves its point without resizing any observed element.
      for (const handle of model.handles()) {
        handle.position();
        handle.offsetX();
        handle.offsetY();
        handle.layout();
      }

      // Right/bottom handle points use the model size, which reconciliation can change after a gesture without
      // resizing any observed element, so the size is a dependency of the sync.
      const hasSize = model.width() >= 0 && model.height() >= 0;
      if (hasSize && !model.culled()) {
        this.scheduleSync();
      }
    });
  }

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

    handles.forEach(({ element }) => {
      if (element) {
        nextElements.add(element);
        // The parent anchors the `auto` layout.
        if (element.parentElement) nextElements.add(element.parentElement);
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
      const nodeElement = this.model.nodeElement();
      // The node rectangle, the rendered zoom and shared anchors are read once for every handle of the node.
      const context =
        !this.model.culled() && nodeElement
          ? createHandleMeasureContext(nodeElement, this.viewportService.readableViewport().zoom)
          : null;
      const measurements = handles.map((handle) => (context ? handle.measure(context) : null));

      handles.forEach((handle, index) => handle.applyGeometry(measurements[index]));
    });
  }
}
