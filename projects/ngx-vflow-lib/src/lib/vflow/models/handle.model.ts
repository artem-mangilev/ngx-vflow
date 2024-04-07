import { computed } from "@angular/core";
import { NodeHandle } from "../services/handle.service";
import { NodeModel } from "./node.model";

export class HandleModel {
  public offset = computed(() => {
    switch (this.rawHandle.position) {
      case 'left': return {
        x: 0,
        y: this.rawHandle.parentPosition().y + (this.rawHandle.parentSize().height / 2)
      }
      case 'right': return {
        x: this.parentNode.size().width,
        y: this.rawHandle.parentPosition().y + (this.rawHandle.parentSize().height / 2)
      }
      case 'top': return {
        x: this.rawHandle.parentPosition().x + (this.rawHandle.parentSize().width / 2),
        y: 0
      }
      case 'bottom': return {
        x: this.rawHandle.parentPosition().x + this.rawHandle.parentSize().width / 2,
        y: this.parentNode.size().height
      }
    }
  })

  public pointAbsolute = computed(() => {
    return {
      x: this.parentNode.point().x + this.offset().x,
      y: this.parentNode.point().y + this.offset().y,
    }
  })

  constructor(
    public rawHandle: NodeHandle,
    private parentNode: NodeModel
  ) { }
}
