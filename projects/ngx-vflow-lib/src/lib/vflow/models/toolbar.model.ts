import { computed, signal, TemplateRef } from '@angular/core';
import { Position } from '../types/position.type';
import { NodeModel } from './node.model';

export class ToolbarModel {
  public position = signal<Position>('top');
  public template = signal<TemplateRef<unknown> | null>(null);

  public offset = signal(10);

  public point = computed(() => {
    switch (this.position()) {
      case 'top':
        return {
          x: this.node.width() / 2 - this.size().width / 2,
          y: -this.size().height - this.offset(),
        };
      case 'bottom':
        return {
          x: this.node.width() / 2 - this.size().width / 2,
          y: this.node.height() + this.offset(),
        };
      case 'left':
        return {
          x: -this.size().width - this.offset(),
          y: this.node.height() / 2 - this.size().height / 2,
        };
      case 'right':
        return {
          x: this.node.width() + this.offset(),
          y: this.node.height() / 2 - this.size().height / 2,
        };
    }
  });

  public transform = computed(() => `translate(${this.point().x}, ${this.point().y})`);

  public size = signal({ width: 0, height: 0 });

  constructor(public node: NodeModel) {}
}
