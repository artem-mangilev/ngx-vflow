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
import { ResizeObserverService } from './resize-observer.service';
import { clientToFlowPosition } from '../utils/coordinates';

import { eventClientPoint } from '../utils/event';

type DragEvent = D3DragEvent<Element, unknown, unknown>;

@Injectable()
export class DraggableService {
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private flowStatusService = inject(FlowStatusService);
  private viewportService = inject(ViewportService);
  private keyboardService = inject(KeyboardService);
  private resizeObserverService = inject(ResizeObserverService);
  private injector = inject(Injector);

  /**
   * Enable draggable behavior for element.
   *
   * @param element target element for toggling draggable
   * @param model model with data for this element
   */
  public enable(element: Element, model: NodeModel) {
    select(element).call(this.getDragBehavior(model, element)).style('touch-action', null);
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
  private getDragBehavior(model: NodeModel, element: Element) {
    let startEvent: MouseEvent | TouchEvent;
    let activated = false;
    let threshold = 0;
    let dragNodes: NodeModel[] = [];
    let initialPositions: Point[] = [];
    let moveNodesOnAutoPanSub: Subscription | null = null;
    let pane: Element | null = null;
    let paneRect: DOMRectReadOnly | null = null;
    let panePositionObserver: IntersectionObserver | null = null;

    const invalidatePaneRect = () => {
      paneRect = null;
    };

    const handlePaneResize = (entry: ResizeObserverEntry) => {
      if (paneRect && (entry.contentRect.width !== paneRect.width || entry.contentRect.height !== paneRect.height)) {
        invalidatePaneRect();
      }
    };

    const observePanePosition = () => {
      if (!pane || !paneRect || typeof IntersectionObserver === 'undefined') {
        return;
      }

      panePositionObserver?.disconnect();
      const rootMargin = `${-paneRect.top}px ${paneRect.right - window.innerWidth}px ${paneRect.bottom - window.innerHeight}px ${-paneRect.left}px`;
      panePositionObserver = new IntersectionObserver(
        ([entry]) => {
          const currentRect = paneRect;
          if (!pane || !currentRect) {
            return;
          }

          if (
            entry.boundingClientRect.left !== currentRect.left ||
            entry.boundingClientRect.top !== currentRect.top ||
            entry.boundingClientRect.width !== currentRect.width ||
            entry.boundingClientRect.height !== currentRect.height
          ) {
            paneRect = entry.boundingClientRect;
            observePanePosition();
          }
        },
        { rootMargin, threshold: 1 },
      );

      panePositionObserver.observe(pane);
    };

    const stopTrackingPaneGeometry = () => {
      if (pane) {
        this.resizeObserverService.removeObserver(pane, handlePaneResize);
      }
      document.removeEventListener('scroll', invalidatePaneRect, true);
      window.removeEventListener('resize', invalidatePaneRect);
      panePositionObserver?.disconnect();
      panePositionObserver = null;
      pane = null;
      paneRect = null;
    };

    const startTrackingPaneGeometry = () => {
      stopTrackingPaneGeometry();
      pane = element.closest('.vflow-pane') ?? element;
      paneRect = pane.getBoundingClientRect();
      observePanePosition();
      this.resizeObserverService.addObserver(pane, handlePaneResize);
      document.addEventListener('scroll', invalidatePaneRect, true);
      window.addEventListener('resize', invalidatePaneRect);
    };

    const getPaneRect = () => {
      if (!pane) {
        throw new Error('Pane geometry is unavailable outside an active drag');
      }

      if (!paneRect) {
        paneRect = pane.getBoundingClientRect();
        observePanePosition();
      }

      return paneRect;
    };

    const filterCondition = (event: Event) => {
      // Do not drag group node if selection occurs inside group node (by keyboard)
      if (isGroupNode(model) && this.keyboardService.isActiveAction('selection')) {
        return false;
      }

      // Match d3-drag defaultFilter: primary button only, no ctrl+click (context menu on macOS)
      if (event instanceof MouseEvent && (event.ctrlKey || event.button !== 0)) {
        return false;
      }

      // Do not drag the node when interacting with a no-drag element (e.g. resize controls)
      if (event.target instanceof Element && event.target.closest('[data-vflow-no-drag]')) {
        return false;
      }

      // if there is at least one drag handle, we should check if we are dragging it
      if (model.dragHandlesCount()) {
        return event.target instanceof Element && !!event.target.closest('.vflow-drag-handle');
      }

      return true;
    };

    const activate = () => {
      activated = true;
      dragNodes = this.getDragNodes(model);
      startTrackingPaneGeometry();

      this.flowStatusService.setNodeDragStartStatus(model);

      // d3-drag event.x/y are screen px (not auto-scaled like the old SVG CTM),
      // so recompute the pointer position in flow space.
      const flow = this.getFlowPoint(startEvent, getPaneRect());

      initialPositions = dragNodes.map((node) => ({
        x: node.point().x - flow.x,
        y: node.point().y - flow.y,
      }));

      // Subscribe to viewport changes during drag to sync node positions with auto-pan
      moveNodesOnAutoPanSub = this.moveNodesOnAutoPan$(dragNodes);
    };

    const behavior = drag()
      .filter(filterCondition)
      .on('start', (event: DragEvent) => {
        startEvent = event.sourceEvent;
        activated = false;
        threshold = this.settingsService.nodeDragThreshold();
        behavior.clickDistance(threshold);
        if (threshold === 0) activate();
      })

      .on('drag', (event: DragEvent) => {
        const starting = !activated;
        if (!activated) {
          const start = eventClientPoint(startEvent);
          const current = eventClientPoint(event.sourceEvent);
          if (Math.hypot(current.x - start.x, current.y - start.y) <= threshold) return;
          activate();
        }
        const flow = this.getFlowPoint(event.sourceEvent, getPaneRect());

        dragNodes.forEach((model, index) => {
          const point = {
            x: round(flow.x + initialPositions[index].x),
            y: round(flow.y + initialPositions[index].y),
          };

          this.alignToGrid(point);
          this.moveNode(model, point);
        });

        if (!starting) this.flowStatusService.setNodeDragStatus(model);
      })

      .on('end', () => {
        if (!activated) return;
        activated = false;
        moveNodesOnAutoPanSub?.unsubscribe();
        moveNodesOnAutoPanSub = null;
        stopTrackingPaneGeometry();
        this.flowStatusService.setNodeDragEndStatus(model);
      });

    return behavior;
  }

  /**
   * Convert the pointer position of a d3-drag source event into flow coordinates,
   * flow = (client - paneRect - {x,y}) / zoom.
   */
  private getFlowPoint(sourceEvent: MouseEvent | TouchEvent, paneRect: DOMRectReadOnly): Point {
    const client = eventClientPoint(sourceEvent);

    return clientToFlowPosition(client, {
      viewport: this.viewportService.readableViewport(),
      containerPosition: { x: paneRect.left, y: paneRect.top },
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
