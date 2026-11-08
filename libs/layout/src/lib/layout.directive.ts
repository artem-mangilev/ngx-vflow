import {
  DestroyRef,
  Directive,
  ErrorHandler,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { Node, Point, VFLOW_INITIALIZATION_GATE, VflowComponent, VflowInitializationGate } from 'ngx-vflow';
import { Observable, Subject, Subscription, concatMap, finalize, from, isObservable, of } from 'rxjs';
import { LayoutAlgorithm, LayoutDragEvent, LayoutGraph, LayoutNode, LayoutResult } from './layout.types';
import { LayoutPositionWriter, VX_LAYOUT_POSITION_WRITER, placeNodes } from './position-writer';

const IMMEDIATE_WRITER: LayoutPositionWriter = {
  write: (targets) => {
    placeNodes(targets);
    return Promise.resolve(true);
  },
  cancel: () => void 0,
};

/**
 * Lays out the nodes of the flow with a `LayoutAlgorithm` and writes the positions into their `point` signals. The
 * layout runs once every node is measured, so content-sized nodes count with their real size, and again when the
 * algorithm or the set of nodes and edges changes. A node being dragged keeps its position, and a run that a newer
 * one replaces is dropped.
 *
 * The first layout happens before the first paint: the directive holds the initialization of the flow until the
 * positions are in, so the graph appears laid out and `(initialized)` sees it that way. Positions are placed at
 * once; `VxLayoutAnimate` on the same element animates the layouts that follow the first.
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
  private readonly writer = inject(VX_LAYOUT_POSITION_WRITER, { optional: true, self: true }) ?? IMMEDIATE_WRITER;

  /**
   * The algorithm, such as `dagreLayout({ rankdir: 'LR' })`. Create it once: a new function starts a new layout.
   * Without one (`<vflow vxLayout>`) the layout runs only through `run(algorithm)`, for example from a button.
   */
  public readonly vxLayout = input<LayoutAlgorithm | null, LayoutAlgorithm | null | ''>(null, {
    transform: (value) => value || null,
  });

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

  /** Lets the flow paint; `null` once it was called, so a layout that runs afterwards may animate. */
  private release: (() => void) | null = null;
  private running: Subscription | null = null;
  private readonly dragging = new Set<string>();
  private readonly drags = new Subject<LayoutDragEvent>();

  constructor() {
    const subscriptions = [
      this.flow.nodeDragStart.subscribe((event) => {
        event.nodes.forEach((node) => this.dragging.add(node.id));
        this.drags.next({ type: 'start', nodes: this.layoutNodes(event.nodes) });
      }),
      this.flow.nodeDrag.subscribe((event) => this.drags.next({ type: 'move', nodes: this.layoutNodes(event.nodes) })),
      this.flow.nodeDragEnd.subscribe((event) => {
        event.nodes.forEach((node) => this.dragging.delete(node.id));
        this.drags.next({ type: 'end', nodes: this.layoutNodes(event.nodes) });
      }),
    ];
    effect(() => {
      const algorithm = this.vxLayout();
      this.structure();
      if (!this.ready()) return;
      // Without an algorithm there is nothing to wait for before the flow paints.
      untracked(() =>
        algorithm ? this.run(algorithm).catch(this.errors.handleError.bind(this.errors)) : this.paint(),
      );
    });
    inject(DestroyRef).onDestroy(() => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.stop();
    });
  }

  /** The flow is measured: the layout runs now, before the flow paints, and `ready` lets it paint afterwards. */
  public onMeasured(ready: () => void): void {
    this.release = ready;
    this.measured.set(true);
  }

  /**
   * Runs the layout now, with the bound algorithm or the given one. Resolves with the result once applied, with the
   * last value of a continuous layout once it completes, or with `null` when a newer run replaced it.
   */
  public run(algorithm: LayoutAlgorithm | null = untracked(this.vxLayout)): Promise<LayoutResult | null> {
    if (!algorithm) throw new Error('VxLayout: no algorithm to run; bind [vxLayout] or pass one to run()');
    this.stop();
    const produced = algorithm(this.graph(), { drags: this.drags.asObservable() });
    // A continuous layout places every value at once; a single result may animate.
    const continuous = isObservable(produced);
    const results: Observable<LayoutResult> = continuous ? produced : from(Promise.resolve(produced));

    return new Promise((resolve, reject) => {
      let last: LayoutResult | null = null;
      let outcome: 'replaced' | 'completed' | Error = 'replaced';
      this.running = results
        .pipe(
          concatMap((result) => {
            const applied = this.apply(result, !continuous);
            return applied instanceof Promise ? applied : of(applied);
          }),
          finalize(() => {
            // A layout that fails or ends empty must not keep the flow hidden.
            this.paint();
            if (outcome instanceof Error) reject(outcome);
            else resolve(outcome === 'completed' ? last : null);
          }),
        )
        .subscribe({
          next: (result) => (last = result ?? last),
          error: (error) => (outcome = error instanceof Error ? error : new Error(String(error))),
          complete: () => {
            outcome = 'completed';
            if (last) this.vxLayoutEnd.emit(last);
          },
        });
    });
  }

  private stop(): void {
    this.running?.unsubscribe();
    this.running = null;
    this.writer.cancel();
  }

  private paint(): void {
    this.release?.();
    this.release = null;
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
   * Writes the flow-space positions into the node-space `point` signals. Resolves with the result once it is in
   * place, or `null` when a later write replaced it. The first positions land at once, before the first paint.
   */
  private apply(result: LayoutResult, animate: boolean): LayoutResult | Promise<LayoutResult | null> {
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

    if (animate && this.release === null) {
      return this.writer.write(targets).then((arrived) => (arrived ? result : null));
    }
    placeNodes(targets);
    this.paint();
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
