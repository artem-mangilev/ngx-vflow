import { computed, signal } from "@angular/core";
import { NodeHandle } from "../services/handle.service";
import { NodeModel } from "./node.model";
export class HandleModel {
  public readonly strokeWidth = 2

  public size = signal({
    width: 10 + (2 * this.strokeWidth),
    height: 10 + (2 * this.strokeWidth)
  })

  public offset = computed(() => {
    switch (this.rawHandle.position) {
      case 'left': return {
        x: 0,
        y: this.parentPosition().y + (this.parentSize().height / 2)
      }
      case 'right': return {
        x: this.parentNode.size().width,
        y: this.parentPosition().y + (this.parentSize().height / 2)
      }
      case 'top': return {
        x: this.parentPosition().x + (this.parentSize().width / 2),
        y: 0
      }
      case 'bottom': return {
        x: this.parentPosition().x + this.parentSize().width / 2,
        y: this.parentNode.size().height
      }
    }
  })

  public sizeOffset = computed(() => {
    switch (this.rawHandle.position) {
      case 'left': return { x: -(this.size().width / 2), y: 0 }
      case 'right': return { x: this.size().width / 2, y: 0 }
      case 'top': return { x: 0, y: -(this.size().height / 2) }
      case 'bottom': return { x: 0, y: this.size().height / 2 }
    }
  })

  public pointAbsolute = computed(() => {
    return {
      x: this.parentNode.point().x + this.offset().x + this.sizeOffset().x,
      y: this.parentNode.point().y + this.offset().y + this.sizeOffset().y,
    }
  })

  public parentSize = signal(this.rawHandle.parentSize)
  public parentPosition = signal(this.rawHandle.parentPosition)

  constructor(
    public rawHandle: NodeHandle,
    private parentNode: NodeModel
  ) { }
}
