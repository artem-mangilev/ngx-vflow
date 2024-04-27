import { computed, signal } from "@angular/core";
import { NodeHandle } from "../services/handle.service";
import { NodeModel } from "./node.model";
import { Subject, map } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
export class HandleModel {
  public readonly strokeWidth = 2

  /**
   * Pre-computed size for default handle, changed dynamically
   * for custom handles
   */
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

  private updateParentSizeAndPosition$ = new Subject<void>()

  public parentSize = toSignal(
    this.updateParentSizeAndPosition$.pipe(
      map(() => ({
        width: this.parentReference.offsetWidth,
        height: this.parentReference.offsetHeight
      }))
    ),
    {
      initialValue: { width: 0, height: 0 }
    }
  )

  public parentPosition = toSignal(
    this.updateParentSizeAndPosition$.pipe(
      map(() => ({
        x: this.parentReference.offsetLeft,
        y: this.parentReference.offsetTop
      }))
    ),
    {
      initialValue: { x: 0, y: 0 }
    }
  )

  public parentReference = this.rawHandle.parentReference!

  public template = this.rawHandle.template

  public templateContext = {
    $implicit: {
      point: this.offset
    }
  }

  constructor(
    public rawHandle: NodeHandle,
    private parentNode: NodeModel
  ) { }

  public updateParent() {
    this.updateParentSizeAndPosition$.next()
  }
}
