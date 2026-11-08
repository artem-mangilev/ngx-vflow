import { DestroyRef, Directive, computed, inject, input } from '@angular/core';
import { Node, Point } from 'ngx-vflow';
import { NodePositionAnimatorOptions, createNodePositionAnimator } from './node-position-animator';
import { LayoutPositionWriter, VX_LAYOUT_POSITION_WRITER } from './position-writer';

/**
 * Animates the nodes into the layouts of `VxLayout` instead of placing them at once. The first layout, which lands
 * before the flow paints, is placed at once regardless. Meant for layouts with one result: a continuous layout moves
 * the nodes itself.
 *
 * ```html
 * <vflow [vxLayout]="layout" vxLayoutAnimate [nodes]="nodes" [edges]="edges" />
 * <vflow [vxLayout]="layout" [vxLayoutAnimate]="{ duration: 300 }" [nodes]="nodes" [edges]="edges" />
 * ```
 */
@Directive({
  selector: 'vflow[vxLayout][vxLayoutAnimate]',
  providers: [{ provide: VX_LAYOUT_POSITION_WRITER, useExisting: VxLayoutAnimate }],
})
export class VxLayoutAnimate implements LayoutPositionWriter {
  /** The options of the animator: `duration`, or `speed` within `minDuration` and `maxDuration`. */
  public readonly vxLayoutAnimate = input<NodePositionAnimatorOptions, NodePositionAnimatorOptions | ''>(
    {},
    { transform: (value) => value || {} },
  );

  /** One animator per set of options; an animation in progress finishes with the animator it started with. */
  private readonly animator = computed(() => createNodePositionAnimator(this.vxLayoutAnimate()));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  public write(targets: ReadonlyMap<Node, Point>): Promise<void> {
    return this.animator().animate(targets);
  }

  public cancel(): void {
    this.animator().cancel();
  }
}
