import { Injectable, effect, inject } from '@angular/core';
import { select } from 'd3-selection';
import { D3DragEvent, drag } from 'd3-drag';
import { NodeModel } from '../models/node.model';
import { round } from '../utils/round';
import { FlowEntitiesService } from './flow-entities.service';
import { Point } from '../interfaces/point.interface';

type DragEvent = D3DragEvent<Element, unknown, unknown>

@Injectable()
export class DraggableService {
  private entitiesService = inject(FlowEntitiesService);

  /**
   * Enable draggable behavior for element.
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public enable(element: Element, model: NodeModel) {
    const d3Element = select(element)

    d3Element.call(this.getDragBehavior(model))
  }

  /**
   * Disable draggable behavior for element.
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public disable(element: Element) {
    const d3Element = select(element)

    d3Element.call(this.getIgnoreDragBehavior())
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
    let dragNodes: NodeModel[] = []
    let initialPositions: Point[] = []

    return drag()
      .filter((event: Event) => {
        // TODO potential bug with deep nested elements of drag element

        if (model.dragHandles().length) {
          return model.dragHandles().includes(event.target as Element)
        }

        return true
      })
      .on('start', (event: DragEvent) => {
        dragNodes = this.getDragNodes(model)

        initialPositions = dragNodes.map(node => ({
          x: node.point().x - event.x,
          y: node.point().y - event.y
        }))
      })

      .on('drag', (event: DragEvent) => {
        dragNodes.forEach((model, index) => {
          let point = {
            x: round(event.x + initialPositions[index].x),
            y: round(event.y + initialPositions[index].y)
          }

          moveNode(model, point)
        })
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

  private getDragNodes(model: NodeModel) {
    return model.selected()
      ? this.entitiesService
        .nodes()
        // selected draggable nodes (with current node)
        .filter(node => node.selected() && node.draggable())
      // we only can move current node if it's not selected
      : [model]
  }
}

function moveNode(model: NodeModel, point: Point) {
  const parent = model.parent()
  // keep node in bounds of parent
  if (parent) {
    point.x = Math.min(parent.size().width - model.size().width, point.x)
    point.x = Math.max(0, point.x)

    point.y = Math.min(parent.size().height - model.size().height, point.y)
    point.y = Math.max(0, point.y)
  }

  model.setPoint(point, true)
}
