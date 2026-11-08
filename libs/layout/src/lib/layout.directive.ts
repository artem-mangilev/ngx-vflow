import { Directive, ErrorHandler, computed, inject, input, output, signal } from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Node, Point, VFLOW_INITIALIZATION_GATE, VflowComponent, VflowInitializationGate } from 'ngx-vflow';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  concatMap,
  defer,
  filter,
  finalize,
  firstValueFrom,
  map,
  merge,
  share,
  switchMap,
  take,
  takeLast,
  tap,
} from 'rxjs';
import { LayoutAlgorithm, LayoutDragEvent, LayoutGraph, LayoutNode, LayoutResult } from './layout.types';
import { VX_LAYOUT_POSITION_WRITER } from './position-writer';

/**
 * Lays out the nodes of the flow with a `LayoutAlgorithm` and writes the positions into their `point` signals. The
 * layout runs once every node is measured, so content-sized nodes count with their real size, and again when the
 * algorithm or the set of nodes and edges changes; a new algorithm function lays the graph out anew, for example from a
 * button after the nodes were moved. A node being dragged keeps its position, and a run that a newer one replaces is
 * dropped.
 *
 * The first layout happens before the first paint: the directive holds the initialization of the flow until the
 * positions are in, so the graph appears laid out and `(initialized)` sees it that way. Positions are placed at
 * once; `VxLayoutAnimate` on the same element animates them once the flow has painted.
 *
 * ```html
 * <vflow [vxLayout]="layout" [nodes]="nodes" [edges]="edges" />
 * ```
 */
@Directive({
  selector: 'vflow[vxLayout]',
  providers: [{ provide: VFLOW_INITIALIZATION_GATE, useExisting: VxLayout }],
})
export class VxLayout implements VflowInitializationGate {
  private readonly flow = inject(VflowComponent);
  private readonly errors = inject(ErrorHandler);
  /** Provided on the flow element by `VxLayoutAnimate`; by default the positions are placed at once. */
  private readonly writer = inject(VX_LAYOUT_POSITION_WRITER);

  /** The algorithm, such as `dagreLayout({ rankdir: 'LR' })`. Create it once: a new function starts a new layout. */
  public readonly vxLayout = input.required<LayoutAlgorithm>();

  /** The result of a finished layout, after any animation. */
  public readonly vxLayoutEnd = output<LayoutResult>();

  /** The flow told the directive that it is measured; a DOM without layout never does. */
  private readonly measured = signal(false);

  /** Every node is measured, so the graph can be laid out. */
  private readonly ready = computed(
    () => this.measured() && this.flow.nodes().every((node) => this.flow.getNodeRect(node.id)),
  );

  /** The set of nodes and edges, so a move or a resize does not count as a change. */
  private readonly structure = computed(
    () =>
      `${this.flow
        .nodes()
        .map((node) => node.id)
        .join('\u0000')}|${this.flow
        .edges()
        .map((edge) => edge.id)
        .join('\u0000')}`,
  );

  /** The first positions are in: the flow may paint. */
  private readonly placed = signal(false);
  private readonly placed$ = toObservable(this.placed);
  private readonly dragging = new Set<string>();

  /** The drags of nodes as an algorithm sees them, with the nodes as they are at that moment. */
  private readonly drags: Observable<LayoutDragEvent> = merge(
    outputToObservable(this.flow.nodeDragStart).pipe(map((event) => ({ type: 'start' as const, ...event }))),
    outputToObservable(this.flow.nodeDrag).pipe(map((event) => ({ type: 'move' as const, ...event }))),
    outputToObservable(this.flow.nodeDragEnd).pipe(map((event) => ({ type: 'end' as const, ...event }))),
  ).pipe(
    map(({ type, nodes }) => ({ type, nodes: this.layoutNodes(nodes) })),
    share(),
  );

  constructor() {
    this.drags.pipe(takeUntilDestroyed()).subscribe(({ type, nodes }) => {
      for (const node of nodes) type === 'end' ? this.dragging.delete(node.id) : this.dragging.add(node.id);
    });

    // A run for every algorithm and every set of nodes and edges, once every node is measured; a newer run replaces
    // the one before it.
    const ready = toObservable(this.ready);
    combineLatest([toObservable(this.vxLayout), toObservable(this.structure)])
      .pipe(
        switchMap(([algorithm]) =>
          ready.pipe(
            filter(Boolean),
            take(1),
            map(() => algorithm),
          ),
        ),
        switchMap((algorithm) => this.layout(algorithm)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /** The flow is measured: the layout runs now, and the flow paints once the first positions are in. */
  public onMeasured(): Promise<void> {
    this.measured.set(true);
    return firstValueFrom(
      this.placed$.pipe(
        filter(Boolean),
        map(() => undefined),
      ),
    );
  }

  /** One run: every result is applied in order and the last one reported. However it ends, the flow paints. */
  private layout(algorithm: LayoutAlgorithm): Observable<LayoutResult> {
    return defer(() => algorithm(this.graph(), { drags: this.drags })).pipe(
      concatMap((result) => this.apply(result)),
      takeLast(1),
      tap((result) => this.vxLayoutEnd.emit(result)),
      catchError((error: unknown) => {
        this.errors.handleError(error);
        return EMPTY;
      }),
      finalize(() => {
        this.writer.cancel();
        // A failed or empty first run must not keep the flow hidden.
        this.placed.set(true);
      }),
    );
  }

  private graph(): LayoutGraph {
    return {
      nodes: this.layoutNodes(this.flow.nodes()),
      edges: this.flow.edges().map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
    };
  }

  /** The nodes as an algorithm sees them, with their rendered rectangles; unmeasured nodes are left out. */
  private layoutNodes(nodes: readonly Node[]): LayoutNode[] {
    return nodes.flatMap((node) => {
      const rect = this.flow.getNodeRect(node.id);
      return rect ? [{ id: node.id, parentId: node.parentId?.() ?? null, ...rect }] : [];
    });
  }

  /**
   * Writes the flow-space positions into the node-space `point` signals and resolves once they are in. Before the
   * first paint they are placed at once, whatever the writer; the flow then paints laid out.
   */
  private async apply(result: LayoutResult): Promise<LayoutResult> {
    const nodes = this.flow.nodes();
    const byId = new Map(nodes.map((node) => [node.id, node]));
    for (const [id, size] of result.sizes ?? []) {
      const node = byId.get(id);
      node?.width?.set(size.width);
      node?.height?.set(size.height);
    }
    const targets = new Map<Node, Point>();
    for (const [id, position] of result.positions) {
      const node = byId.get(id);
      if (!node || this.dragging.has(id)) continue;
      const origin = this.flowOrigin(node, byId, result);
      targets.set(node, { x: position.x - origin.x, y: position.y - origin.y });
    }

    await this.writer.write(targets, { first: !this.placed() });
    this.placed.set(true);
    return result;
  }

  /** Flow position of the parent of a node: from the result when it moves the parent, else as rendered now. */
  private flowOrigin(node: Node, byId: ReadonlyMap<string, Node>, result: LayoutResult): Point {
    const parentId = node.parentId?.();
    if (!parentId) return { x: 0, y: 0 };
    const laidOut = result.positions.get(parentId);
    if (laidOut) return laidOut;
    const parent = byId.get(parentId);
    const rect = parent && this.flow.getNodeRect(parent.id);

    return rect ? { x: rect.x, y: rect.y } : { x: 0, y: 0 };
  }
}
