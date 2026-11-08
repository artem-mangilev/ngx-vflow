import { DestroyRef, Directive, computed, inject, input } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { Node, Point, VflowComponent } from 'ngx-vflow';
import { NodePositionAnimatorOptions, createNodePositionAnimator } from './node-position-animator';
import { LayoutPositionWriter, VX_LAYOUT_POSITION_WRITER, placeNodes } from './position-writer';

/**
 * Animates the nodes into the layouts of `VxLayout` instead of placing them at once. Until the flow has painted,
 * which is after the first layout, the nodes are placed at once: there is nothing to animate yet. Meant for layouts
 * with one result: a continuous layout moves the nodes itself.
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

  private painted = false;

  constructor() {
    outputToObservable(inject(VflowComponent).initialized).subscribe(() => (this.painted = true));
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  public write(targets: ReadonlyMap<Node, Point>): Promise<void> {
    if (!this.painted) {
      placeNodes(targets);
      return Promise.resolve();
    }
    return this.animator().animate(targets);
  }

  public cancel(): void {
    this.animator().cancel();
  }
}
