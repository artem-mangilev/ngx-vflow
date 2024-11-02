import { computed, signal } from "@angular/core";
import { NodeHandle } from "../services/handle.service";
import { NodeModel } from "./node.model";
import { Subject, map } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

export type HandleState = 'valid' | 'invalid' | 'idle'

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
      x: this.parentNode.globalPoint().x + this.offset().x + this.sizeOffset().x,
      y: this.parentNode.globalPoint().y + this.offset().y + this.sizeOffset().y,
    }
  })

  public state = signal<HandleState>('idle')

  private updateParentSizeAndPosition$ = new Subject<void>()

  public parentSize = toSignal(
    this.updateParentSizeAndPosition$.pipe(
      map(() => this.getParentSize())
    ),
    {
      initialValue: { width: 0, height: 0 }
    }
  )

  public parentPosition = toSignal(
    this.updateParentSizeAndPosition$.pipe(
      map(() => ({
        x: this.parentReference instanceof HTMLElement
          ? this.parentReference.offsetLeft
          : 0, // for now just 0 for group nodes
        y: this.parentReference instanceof HTMLElement
          ? this.parentReference.offsetTop
          : 0 // for now just 0 for group nodes
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
      point: this.offset,
      state: this.state,
      node: this.parentNode.node
    }
  }

  constructor(
    public rawHandle: NodeHandle,
    public parentNode: NodeModel
  ) { }

  public updateParent() {
    this.updateParentSizeAndPosition$.next()
  }

  private getParentSize(): { width: number, height: number } {
    if (this.parentReference instanceof HTMLElement) {
      return {
        width: this.parentReference.offsetWidth,
        height: this.parentReference.offsetHeight
      }
    } else if (this.parentReference instanceof SVGGraphicsElement) {
      return this.parentReference.getBBox()
    }

    return { width: 0, height: 0 }
  }
}
