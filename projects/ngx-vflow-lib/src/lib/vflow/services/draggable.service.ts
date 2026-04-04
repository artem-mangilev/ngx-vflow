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
import type { Subscription } from 'rxjs';
import { pairwise, filter, skip } from 'rxjs/operators';
import { KeyboardService } from './keyboard.service';
import { isGroupNode } from '../utils/is-group-node';

type DragEvent = D3DragEvent<Element, unknown, unknown>;

@Injectable()
export class DraggableService {
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private flowStatusService = inject(FlowStatusService);
  private viewportService = inject(ViewportService);
  private keyboardService = inject(KeyboardService);
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
   */
  public disable(element: Element) {
    this.clearDrag(element);
  }

  /**
   * Remove d3-drag listeners and inline styles it applied (so pointer events can reach root zoom).
   */
  public destroy(element: Element) {
    this.clearDrag(element);
  }

  private clearDrag(element: Element) {
    const s = select(element);
    s.on('.drag', null);
    s.style('touch-action', null);
    s.style('-webkit-tap-highlight-color', null);
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
      // Do not drag group node if selection occurs inside group node (by keyboard)
      if (isGroupNode(model) && this.keyboardService.isActiveAction('selection')) {
        return false;
      }

      // Match d3-drag defaultFilter: primary button only, no ctrl+click (context menu on macOS)
      if (event instanceof MouseEvent && (event.ctrlKey || event.button !== 0)) {
        return false;
      }

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
          // do not drag descendants if selected ancestor is already dragged
          .filter((node) => !this.hasSelectedDraggableAncestor(node))
      : // we only can move current node if it's not selected
        [model];
  }

  private hasSelectedDraggableAncestor(node: NodeModel) {
    let parent = node.parent();

    while (parent) {
      if (parent.selected() && parent.draggable()) {
        return true;
      }

      parent = parent.parent();
    }

    return false;
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
        filter(
          ([prev, next]) => prev.zoom === next.zoom && (prev.x !== next.x || prev.y !== next.y), // Pan only, not wheel zoom (x/y+k change together)
        ),
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
