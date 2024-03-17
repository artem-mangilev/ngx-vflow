import { Injectable } from '@angular/core';
import { select } from 'd3-selection';
import { D3DragEvent, drag } from 'd3-drag';
import { NodeModel } from '../models/node.model';
import { round } from '../utils/round';

type DragEvent = D3DragEvent<Element, unknown, unknown>

@Injectable()
export class DraggableService {
  /**
   * Enable or disable draggable behavior for element.
   * model contains draggable flag which declares if draggable should be enabled or not
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public toggleDraggable(element: Element, model: NodeModel) {
    const d3Element = select(element)

    const behavior = model.draggable
      ? this.getDragBehavior(model)
      : this.getIgnoreDragBehavior()

    d3Element.call(behavior)
  }

  /**
   * TODO: not shure if this work, need to check
   *
   * @param element
   */
  public destroy(element: Element) {
    select(element).on('.drag', null)
  }

  /**
   * Node drag behavior. Updated node's coordinate according to dragging
   *
   * @param model
   * @returns
   */
  private getDragBehavior(model: NodeModel) {
    let deltaX: number
    let deltaY: number

    return drag()
      .on('start', (event: DragEvent) => {
        deltaX = model.point().x - event.x
        deltaY = model.point().y - event.y
      })

      .on('drag', (event: DragEvent) => {
        model.point.set(
          {
            x: round(event.x + deltaX),
            y: round(event.y + deltaY)
          }
        )
      })
  }

  /**
   * Specify ignoring drag behavior. It's responsible for not moving the map when user tries to drag node
   * with disabled drag behavior
   */
  private getIgnoreDragBehavior() {
    return drag()
      .on('drag', (event: DragEvent) => {
        (event.sourceEvent as Event).stopPropagation()
      })
  }
}
