import { Injectable, Injector, inject } from '@angular/core';
import { select } from 'd3-selection';
import { D3DragEvent, drag } from 'd3-drag';
import { NodeModel } from '../models/node.model';
import { round } from '../utils/round';
import { FlowEntitiesService } from './flow-entities.service';
import { Point } from '../interfaces/point.interface';
import { FlowSettingsService } from './flow-settings.service';
import { align } from '../utils/align-number';
import { FlowStatusService } from './flow-status.service';
import { ViewportService } from './viewport.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription, pairwise, filter, skip } from 'rxjs';

type DragEvent = D3DragEvent<Element, unknown, unknown>;

@Injectable()
export class DraggableService {
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private flowStatusService = inject(FlowStatusService);
  private viewportService = inject(ViewportService);
  private injector = inject(Injector);

  /**
   * Enable draggable behavior for element.
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public enable(element: Element, model: NodeModel) {
    select(element).call(this.getDragBehavior(model));
  }

  /**
   * Disable draggable behavior for element.
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public disable(element: Element) {
    select(element).call(drag().on('drag', null));
  }

  /**
   * TODO: not shure if this work, need to check
   *
   * @param element
   */
  public destroy(element: Element) {
    select(element).on('.drag', null);
  }

  /**
   * Node drag behavior. Updated node's coordinate according to dragging
   *
   * @param model
   * @returns
   */
  private getDragBehavior(model: NodeModel) {
    let dragNodes: NodeModel[] = [];
    let initialPositions: Point[] = [];
    let moveNodesOnAutoPanSub: Subscription | null = null;

    const filterCondition = (event: Event) => {
      // if there is at least one drag handle, we should check if we are dragging it
      if (model.dragHandlesCount()) {
        return !!(event.target as Element).closest('.vflow-drag-handle');
      }

      return true;
    };

    return drag()
      .filter(filterCondition)
      .on('start', (event: DragEvent) => {
        dragNodes = this.getDragNodes(model);

        this.flowStatusService.setNodeDragStartStatus(model);

        initialPositions = dragNodes.map((node) => ({
          x: node.point().x - event.x,
          y: node.point().y - event.y,
        }));

        // Subscribe to viewport changes during drag to sync node positions with auto-pan
        moveNodesOnAutoPanSub = this.moveNodesOnAutoPan$(dragNodes);
      })

      .on('drag', (event: DragEvent) => {
        dragNodes.forEach((model, index) => {
          const point = {
            x: round(event.x + initialPositions[index].x),
            y: round(event.y + initialPositions[index].y),
          };

          this.alignToGrid(point);
          this.moveNode(model, point);
        });

        this.flowStatusService.setNodeDragStatus(model);
      })

      .on('end', () => {
        moveNodesOnAutoPanSub?.unsubscribe();
        moveNodesOnAutoPanSub = null;
        this.flowStatusService.setNodeDragEndStatus(model);
      });
  }

  private getDragNodes(model: NodeModel) {
    return model.selected()
      ? this.entitiesService
          .nodes()
          // selected draggable nodes (with current node)
          .filter((node) => node.selected() && node.draggable())
      : // we only can move current node if it's not selected
        [model];
  }

  /**
   * @todo make it unit testable
   */
  private moveNode(model: NodeModel, point: Point) {
    const parent = model.parent();

    // keep node in bounds of parent
    if (model.extent() === 'parent' && parent) {
      point.x = Math.min(parent.width() - model.width(), point.x);
      point.x = Math.max(0, point.x);

      point.y = Math.min(parent.height() - model.height(), point.y);
      point.y = Math.max(0, point.y);
    }

    model.setPoint(point);
  }

  /**
   * @todo make it unit testable
   */
  private alignToGrid(point: Point) {
    const [snapX, snapY] = this.settingsService.snapGrid();

    if (snapX > 1) {
      point.x = align(point.x, snapX);
    }

    if (snapY > 1) {
      point.y = align(point.y, snapY);
    }

    return point;
  }

  private moveNodesOnAutoPan$(dragNodes: NodeModel[]) {
    return toObservable(this.viewportService.readableViewport, { injector: this.injector })
      .pipe(
        skip(1), // Skip initial value
        pairwise(),
        filter(([prev, next]) => prev.x !== next.x || prev.y !== next.y), // Only translate changes
      )
      .subscribe(([prev, next]) => {
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const zoom = next.zoom;

        // Calculate shift in flow space (inverse of viewport shift)
        const shiftX = -dx / zoom;
        const shiftY = -dy / zoom;

        // Update each dragged node
        dragNodes.forEach((node) => {
          // Move node using existing pipeline (snap + parent bounds)
          const newPoint = {
            x: node.point().x + shiftX,
            y: node.point().y + shiftY,
          };
          this.moveNode(node, newPoint);
        });
      });
  }
}
