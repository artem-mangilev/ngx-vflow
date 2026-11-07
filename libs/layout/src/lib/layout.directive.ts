import { DestroyRef, Directive, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { Node, Point, VFLOW_INITIALIZATION_GATE, VflowComponent, VflowInitializationGate } from 'ngx-vflow';
import { Observable, Subject, Subscription, isObservable, lastValueFrom } from 'rxjs';
import { LayoutAlgorithm, LayoutDragEvent, LayoutGraph, LayoutNode, LayoutResult } from './layout.types';
import {
  NodePositionAnimator,
  NodePositionAnimatorOptions,
  createNodePositionAnimator,
} from './node-position-animator';

/** When the layout runs: on every change of the algorithm or of the set of nodes and edges, or only on `run()`. */
export type LayoutTrigger = 'auto' | 'manual';

/** Whether the nodes move to their new positions at once or animated, with the animator's options. */
export type LayoutAnimation = boolean | NodePositionAnimatorOptions;

/**
 * Lays out the nodes of the flow with a `LayoutAlgorithm` and writes the positions into their `point` signals. The
 * layout runs once every node is measured, so content-sized nodes count with their real size, and again when the
 * algorithm or the set of nodes and edges changes. A node being dragged keeps its position, and a result that
 * arrives after a newer run started is dropped.
 *
 * The first layout happens before the first paint: the directive holds the initialization of the flow until the
 * positions are in, so the graph appears laid out and `(initialized)` sees it that way. Only later layouts animate.
 *
 * ```html
 * <vflow [vxLayout]="layout" [vxLayoutAnimate]="true" [nodes]="nodes" [edges]="edges" />
 * ```
 */
@Directive({
  selector: 'vflow[vxLayout]',
  providers: [{ provide: VFLOW_INITIALIZATION_GATE, useExisting: VxLayout }],
})
export class VxLayout implements VflowInitializationGate {
  private readonly flow = inject(VflowComponent);

  /** The algorithm, such as `dagreLayout({ rankdir: 'LR' })`. Create it once: a new function starts a new layout. */
  public readonly vxLayout = input.required<LayoutAlgorithm>();

  public readonly vxLayoutTrigger = input<LayoutTrigger>('auto');

  /** Animates the nodes into the layout. A continuous layout, from an observable, always applies at once. */
  public readonly vxLayoutAnimate = input<LayoutAnimation>(false);

  /** The result of a finished layout, after any animation. */
  public readonly vxLayoutEnd = output<LayoutResult>();

  /** The first positions are in; the flow may paint. */
  private readonly placed = signal(false);

  /** The flow told the directive that it is measured; a DOM without layout never does. */
  private readonly flowMeasured = signal(false);

  /** Lets the flow paint, once the first automatic layout is applied or at once with the manual trigger. */
  private readonly ready = signal<(() => void) | null>(null);

  /** Every node is measured, so the graph can be laid out. */
  private readonly measured = computed(
    () => this.flowMeasured() && this.flow.nodes().every((node) => this.flow.getNodeRect(node.id)),
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

  private readonly dragging = new Set<string>();
  private readonly drags = new Subject<LayoutDragEvent>();
  private animator: NodePositionAnimator | null = null;
  private subscription: Subscription | null = null;
  private generation = 0;

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
      const structure = this.structure();
      if (this.vxLayoutTrigger() !== 'auto' || !this.measured()) return;
      untracked(() => void this.start(algorithm, structure));
    });
    // The flow paints once the first automatic layout is in, or at once with the manual trigger.
    effect(() => {
      const ready = this.ready();
      if (ready && (this.vxLayoutTrigger() !== 'auto' || this.placed())) ready();
    });
    inject(DestroyRef).onDestroy(() => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.stop();
    });
  }

  /** The flow is measured: the layout runs now, before the flow paints, and `ready` lets it paint afterwards. */
  public onMeasured(ready: () => void): void {
    this.ready.set(ready);
    this.flowMeasured.set(true);
  }

  /** Runs the layout now; resolves with its result once applied, or `null` when a newer run replaced it. */
  public run(): Promise<LayoutResult | null> {
    return untracked(() => this.start(this.vxLayout(), this.structure()));
  }

  private async start(algorithm: LayoutAlgorithm, structure: string): Promise<LayoutResult | null> {
    this.stop();
    const generation = ++this.generation;
    const current = () => generation === this.generation && this.structure() === structure;
    try {
      const graph = this.buildGraph();
      const produced = algorithm(graph, { drags: this.drags.asObservable() });

      if (isObservable(produced)) {
        // A continuous layout: every value lands at once, and the last one is the result.
        const values = new Observable<LayoutResult>((subscriber) => {
          this.subscription = produced.subscribe({
            next: (result) => {
              if (current()) {
                this.apply(result);
                this.placed.set(true);
              }
              subscriber.next(result);
            },
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        });
        const result = await lastValueFrom(values, { defaultValue: null });
        if (!current() || !result) return null;
        this.vxLayoutEnd.emit(result);
        return result;
      }

      const result = await produced;
      if (!current()) return null;
      // The first positions land before the first paint; only later layouts animate.
      const arrived = await this.apply(result, this.placed() ? this.vxLayoutAnimate() : false);
      this.placed.set(true);
      if (!arrived || !current()) return null;
      this.vxLayoutEnd.emit(result);
      return result;
    } finally {
      // A failed layout must not keep the flow hidden.
      if (current()) this.placed.set(true);
    }
  }

  private stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.animator?.cancel();
    this.animator = null;
  }

  private buildGraph(): LayoutGraph {
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

  /** Writes the flow-space positions into the node-space `point` signals, at once or animated. */
  private async apply(result: LayoutResult, animation: LayoutAnimation = false): Promise<boolean> {
    const nodes = this.flow.nodes();
    const byId = new Map(nodes.map((node) => [node.id, node]));
    for (const [id, size] of result.sizes ?? []) {
      const node = byId.get(id);
      node?.width?.set(size.width);
      node?.height?.set(size.height);
    }
    const targets = new Map<string, Point>();
    for (const [id, position] of result.positions) {
      const node = byId.get(id);
      if (!node || this.dragging.has(id)) continue;
      const origin = this.flowOrigin(node, byId, result);
      targets.set(id, { x: position.x - origin.x, y: position.y - origin.y });
    }

    if (!animation) {
      for (const [id, point] of targets) byId.get(id)?.point.set(point);
      return true;
    }
    this.animator?.cancel();
    this.animator = createNodePositionAnimator(nodes, animation === true ? {} : animation);
    return this.animator.animate(targets);
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
