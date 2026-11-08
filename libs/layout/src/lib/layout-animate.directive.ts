import { DestroyRef, Directive, computed, inject, input } from '@angular/core';
import { NodeAnimatorOptions, createNodeAnimator } from './node-animator';
import { LayoutPositionWriter, NodeTargets, VX_LAYOUT_POSITION_WRITER, placeNodes } from './position-writer';

/**
 * Animates the nodes, positions and sizes, into the layouts of `VxLayout` instead of placing them at once. The first
 * positions, which land before the flow paints, are placed at once: there is nothing to animate yet. Meant for layouts with one result: a
 * continuous layout moves the nodes itself.
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
  public readonly vxLayoutAnimate = input<NodeAnimatorOptions, NodeAnimatorOptions | ''>(
    {},
    { transform: (value) => value || {} },
  );

  /** One animator per set of options; an animation in progress finishes with the animator it started with. */
  private readonly animator = computed(() => createNodeAnimator(this.vxLayoutAnimate()));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  public write(targets: NodeTargets, { first }: { first: boolean }): Promise<void> {
    if (first) {
      placeNodes(targets);
      return Promise.resolve();
    }
    return this.animator().animate(targets);
  }

  public cancel(): void {
    this.animator().cancel();
  }
}
