import { computed, signal, TemplateRef } from "@angular/core";
import { Position } from "../types/position.type";
import { NodeModel } from "./node.model";

export class ToolbarModel {
  public visible = signal(false)
  public position = signal<Position>('top')
  public template = signal<TemplateRef<unknown> | null>(null)

  public offset = signal(10)

  public point = computed(() => {
    switch (this.position()) {
      case 'top':
        return {
          x: this.node.point().x + this.node.size().width / 2 - this.size().width / 2,
          y: this.node.point().y - this.size().height - this.offset()
        }
      case 'bottom':
        return {
          x: this.node.point().x + this.node.size().width / 2 - this.size().width / 2,
          y: this.node.point().y + this.node.size().height + this.offset()
        }
      case 'left':
        return {
          x: this.node.point().x - this.size().width - this.offset(),
          y: this.node.point().y + this.node.size().height / 2 - this.size().height / 2
        }
      case 'right':
        return {
          x: this.node.point().x + this.node.size().width + this.offset(),
          y: this.node.point().y + this.node.size().height / 2 - this.size().height / 2
        }
    }
  })

  public size = signal({ width: 50, height: 50 })

  constructor(private node: NodeModel) { }
}
