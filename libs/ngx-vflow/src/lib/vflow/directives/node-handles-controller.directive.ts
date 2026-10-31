import { DestroyRef, Directive, ElementRef, effect, inject, input, untracked } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { ResizeObserverService } from '../services/resize-observer.service';
import { AfterRenderBatchService } from '../services/after-render-batch.service';
import { createHandleMeasureContext, HandleModel } from '../models/handle.model';
import { ViewportService } from '../services/viewport.service';
import { FlowRenderingService } from '../services/flow-rendering.service';

/**
 * Measures the handles of the node whenever their DOM may have changed: a handle is added, an observed element is
 * resized, or the content of the node is restructured. Everything else that moves a handle, such as a side, an
 * offset or the node size, is derived by the handle model without a measurement.
 */
@Directive({
  selector: '[nodeHandlesController]',
  standalone: true,
})
export class NodeHandlesControllerDirective {
  // An input, not the NODE_MODEL token: the directive is created with the node view, before the node input is set.
  public readonly model = input.required<NodeModel>();
  private readonly host = inject<ElementRef<Element>>(ElementRef).nativeElement;
  private readonly resizeObserverService = inject(ResizeObserverService);
  private readonly afterRenderBatch = inject(AfterRenderBatchService);
  private readonly viewportService = inject(ViewportService);
  private readonly flowRenderingService = inject(FlowRenderingService);
  private readonly observedElements = new Set<Element>();
  private destroyed = false;
  private readonly resizeCallback = () => this.scheduleSync();
  private readonly sync = () => this.measureHandles();

  constructor() {
    effect(() => {
      const handles = this.model().handles();
      untracked(() => {
        this.updateObservedElements(handles);
        this.scheduleSync();
      });
    });

    // Reordering or inserting content, such as field rows, moves handles without resizing anything: a row of
    // the same height moved up keeps every observed box. Only the structure is watched, not text or attributes.
    // zone.js in happy-dom replaces MutationObserver with a class without methods; that DOM has no layout to sync.
    const created = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(this.resizeCallback);
    const structure = typeof created?.observe === 'function' ? created : undefined;
    structure?.observe(this.host, { childList: true, subtree: true });

    inject(DestroyRef).onDestroy(() => {
      structure?.disconnect();
      this.destroyed = true;
      this.observedElements.forEach((element) =>
        this.resizeObserverService.removeObserver(element, this.resizeCallback),
      );
      this.observedElements.clear();
    });
  }

  private updateObservedElements(handles: HandleModel[]): void {
    const nextElements = new Set<Element>([this.host]);

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

  /** One measurement after the next render, however many changes asked for it. */
  private scheduleSync(): void {
    if (this.destroyed || !this.model().handles().length) return;
    this.afterRenderBatch.read(this.sync);
  }

  private measureHandles(): void {
    if (this.destroyed) return;
    const model = this.model();
    const nodeElement = model.nodeElement();
    if (model.culled() || !nodeElement) return;

    // The node rectangle, the rendered zoom and shared anchors are read once for every handle of the node.
    const handles = model.handles();
    const context = createHandleMeasureContext(
      nodeElement,
      this.flowRenderingService.viewport(),
      this.viewportService.readableViewport().zoom,
    );
    const measurements = handles.map((handle) => handle.measure(context));

    handles.forEach((handle, index) => handle.applyMeasurement(measurements[index]));
  }
}
