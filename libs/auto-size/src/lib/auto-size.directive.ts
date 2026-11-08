import { DestroyRef, Directive, inject, input } from '@angular/core';
import { Node, Rect, VflowComponent } from 'ngx-vflow';

/** Space kept between the children and the sides of their parent, in flow units: one value or one per side. */
export type AutoSizePadding = number | { top?: number; right?: number; bottom?: number; left?: number };

/** Decides whether a parent node grows around its children. */
export type AutoSizeShouldResize = (parent: Node) => boolean;

interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Grows a parent node around its children when the flow is initialized and while they are dragged or resized,
 * through every level of nesting; with `vxAutoSizeShrink`, the parent also shrinks and always fits its children. A
 * parent is sized on the axes it sizes explicitly: a `width` signal for the horizontal axis, a `height` signal for the
 * vertical one. A change on the left or the top moves the origin of the parent and keeps the children where they are.
 * Children that may leave their parent need `extent: null`, since `extent: 'parent'` holds them inside before the
 * parent can grow.
 *
 * ```html
 * <vflow vxAutoSize [vxAutoSizePadding]="16" [nodes]="nodes" />
 * ```
 */
@Directive({ selector: 'vflow[vxAutoSize]' })
export class VxAutoSize {
  private readonly flow = inject(VflowComponent);

  /** Space kept between the children and the sides of the parent. */
  public readonly vxAutoSizePadding = input<AutoSizePadding>(24);

  /** Which parents grow; every parent by default. */
  public readonly vxAutoSizeShouldResize = input<AutoSizeShouldResize>(() => true);

  /**
   * Whether a parent also shrinks, so it always fits its children: from the first paint, and on every frame of a drag,
   * so nothing jumps when the drag ends. A parent only grows by default.
   */
  public readonly vxAutoSizeShrink = input(false);

  constructor() {
    const subscriptions = [
      // Emitted before the first paint, so the parents already fit their children in the first frame.
      this.flow.initialized.subscribe(() => this.fitAncestors(this.flow.nodes(), this.vxAutoSizeShrink())),
      this.flow.nodeDrag.subscribe((event) => this.fitAncestors(event.nodes, this.vxAutoSizeShrink())),
      this.flow.nodeDragEnd.subscribe((event) => this.fitAncestors(event.nodes, this.vxAutoSizeShrink())),
      this.flow.nodesChangesSize.subscribe((changes) =>
        this.fitAncestors(
          changes.map((change) => this.flow.getNode(change.id)).filter((node): node is Node => !!node),
          this.vxAutoSizeShrink(),
        ),
      ),
    ];
    inject(DestroyRef).onDestroy(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
  }

  /** Fits every ancestor of the nodes, the deepest first, so a grown parent counts for its own parent. */
  private fitAncestors(nodes: readonly Node[], allowShrink: boolean): void {
    const all = this.flow.nodes();
    const byId = new Map(all.map((node) => [node.id, node]));
    const childrenOf = new Map<string, Node[]>();
    for (const node of all) {
      const parentId = node.parentId?.();
      if (parentId) childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), node]);
    }

    const ancestors = new Map<Node, number>();
    for (const node of nodes) {
      let depth = 0;
      for (let parent = byId.get(node.parentId?.() ?? ''); parent; parent = byId.get(parent.parentId?.() ?? '')) {
        ancestors.set(parent, Math.max(ancestors.get(parent) ?? 0, ++depth));
        if (depth > all.length) break;
      }
    }

    const shouldResize = this.vxAutoSizeShouldResize();
    const sides = normalizePadding(this.vxAutoSizePadding());
    [...ancestors.entries()]
      .sort(([, a], [, b]) => a - b)
      .forEach(([parent]) => {
        if (shouldResize(parent)) this.fit(parent, childrenOf.get(parent.id) ?? [], sides, allowShrink);
      });
  }

  /** Sizes one parent around its rendered children, in the node space of the parent. */
  private fit(parent: Node, children: readonly Node[], padding: Sides, allowShrink: boolean): void {
    const origin = this.flow.getNodeRect(parent.id);
    const rects = children.map((child) => this.flow.getNodeRect(child.id)).filter((rect): rect is Rect => !!rect);
    if (!origin || rects.length === 0) return;

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const rect of rects) {
      left = Math.min(left, rect.x - origin.x - padding.left);
      top = Math.min(top, rect.y - origin.y - padding.top);
      right = Math.max(right, rect.x - origin.x + rect.width + padding.right);
      bottom = Math.max(bottom, rect.y - origin.y + rect.height + padding.bottom);
    }
    if (!allowShrink) {
      left = Math.min(left, 0);
      top = Math.min(top, 0);
      right = Math.max(right, parent.width?.() ?? origin.width);
      bottom = Math.max(bottom, parent.height?.() ?? origin.height);
    }

    // An axis without an explicit size follows the content and is left alone.
    const dx = parent.width ? left : 0;
    const dy = parent.height ? top : 0;
    if (dx !== 0 || dy !== 0) {
      parent.point.update((point) => ({ x: point.x + dx, y: point.y + dy }));
      for (const child of children) child.point.update((point) => ({ x: point.x - dx, y: point.y - dy }));
    }
    if (parent.width && right - left !== parent.width()) parent.width.set(right - left);
    if (parent.height && bottom - top !== parent.height()) parent.height.set(bottom - top);
  }
}

function normalizePadding(padding: AutoSizePadding): Sides {
  if (typeof padding === 'number') return { top: padding, right: padding, bottom: padding, left: padding };

  return { top: padding.top ?? 0, right: padding.right ?? 0, bottom: padding.bottom ?? 0, left: padding.left ?? 0 };
}
