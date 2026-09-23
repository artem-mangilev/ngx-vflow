import { computed, signal, TemplateRef } from '@angular/core';
import { Position } from '../types/position.type';
import { NodeModel } from './node.model';

export class ToolbarModel {
  public position = signal<Position>('top');
  public template = signal<TemplateRef<unknown> | null>(null);

  /** Gap between the node side and the toolbar, in flow units. */
  public offset = signal(10);

  /**
   * The point of the node side the toolbar is attached to, in node coordinates.
   * The toolbar's own size never enters it, so the toolbar lands in place on its first frame.
   */
  public anchor = computed(() => {
    switch (this.position()) {
      case 'top':
        return { x: this.node.width() / 2, y: -this.offset() };
      case 'bottom':
        return { x: this.node.width() / 2, y: this.node.height() + this.offset() };
      case 'left':
        return { x: -this.offset(), y: this.node.height() / 2 };
      case 'right':
        return { x: this.node.width() + this.offset(), y: this.node.height() / 2 };
    }
  });

  /** Shift of the toolbar box away from the anchor, in percent of the box's own size. */
  public shift = computed(() => {
    switch (this.position()) {
      case 'top':
        return { x: -50, y: -100 };
      case 'bottom':
        return { x: -50, y: 0 };
      case 'left':
        return { x: -100, y: -50 };
      case 'right':
        return { x: 0, y: -50 };
    }
  });

  /** CSS transform of the toolbar host inside the (zoomed) viewport. */
  public transform = computed(() => {
    const { x, y } = this.node.globalPoint();
    const anchor = this.anchor();
    const shift = this.shift();

    return `translate(${x + anchor.x}px, ${y + anchor.y}px) translate(${shift.x}%, ${shift.y}%)`;
  });

  constructor(public node: NodeModel) {}
}
