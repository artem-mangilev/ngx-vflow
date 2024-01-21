import { Injectable } from '@angular/core';
import { select } from 'd3-selection';
import { D3DragEvent, drag } from 'd3-drag';
import { NodeModel } from '../models/node.model';

type DragEvent = D3DragEvent<Element, unknown, unknown>

@Injectable()
export class DraggableService {
  public makeDraggable(element: Element, model: NodeModel) {
    const d3Element = select(element)

    let deltaX: number
    let deltaY: number

    const dragBehavior = drag()
      .on('start', (event: DragEvent) => {
        deltaX = model.position().x - event.x
        deltaY = model.position().y - event.y
      })

      .on('drag', (event: DragEvent) => {
        model.position.set(
          { x: event.x + deltaX, y: event.y + deltaY }
        )
      })

    d3Element.call(dragBehavior)
  }

  /**
   * TODO: not shure if this work, need to check
   *
   * @param element
   */
  public destroy(element: Element) {
    select(element).on('.drag', null)
  }
}
