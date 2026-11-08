import { DestroyRef, Directive, computed, inject, input } from '@angular/core';
import { Node, Point } from 'ngx-vflow';
import { NodePositionAnimatorOptions, createNodePositionAnimator } from './node-position-animator';
import { LayoutPositionWriter, VX_LAYOUT_POSITION_WRITER, placeNodes } from './position-writer';

/** Whether the nodes move to their new positions animated, with the options of the animator, or at once. */
export type LayoutAnimation = boolean | NodePositionAnimatorOptions;

/**
 * Animates the nodes into the layouts of `VxLayout` instead of placing them at once. The first layout, which lands
 * before the flow paints, and the values of a continuous layout are placed at once regardless.
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
  /** `true`, or the options of the animator: `duration`, or `speed` within `minDuration` and `maxDuration`. */
  public readonly vxLayoutAnimate = input<LayoutAnimation, LayoutAnimation | ''>(true, {
    transform: (value) => value === '' || value,
  });

  private readonly animator = computed(() => {
    const animation = this.vxLayoutAnimate();
    return createNodePositionAnimator(typeof animation === 'object' ? animation : {});
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  public write(targets: ReadonlyMap<Node, Point>): Promise<boolean> {
    if (!this.vxLayoutAnimate()) {
      placeNodes(targets);
      return Promise.resolve(true);
    }
    return this.animator().animate(targets);
  }

  public cancel(): void {
    this.animator().cancel();
  }
}
