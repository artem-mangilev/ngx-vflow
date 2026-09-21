import { Injectable, Injector, inject, signal } from '@angular/core';
import { select } from 'd3-selection';
import { D3DragEvent, drag } from 'd3-drag';
import { NodeModel } from '../models/node.model';
import { round } from '../utils/round';
import { FlowEntitiesService } from './flow-entities.service';
import { Point } from '../interfaces/point.interface';
import { FlowSettingsService } from './flow-settings.service';
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
import { GeometryPipelineService } from './geometry-pipeline.service';
import { GeometryChange, GestureSession, KEYBOARD_MOVE_STEP } from '../features/geometry-intent.interface';
import { id } from '../utils/id';
import { Rect } from '../interfaces/rect';

type DragEvent = D3DragEvent<Element, unknown, unknown>;

@Injectable()
export class DraggableService {
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private flowStatusService = inject(FlowStatusService);
  private viewportService = inject(ViewportService);
  private keyboardService = inject(KeyboardService);
  private resizeObserverService = inject(ResizeObserverService);
  private pipeline = inject(GeometryPipelineService);
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

  /** Moves the selection by one step as a one-shot keyboard gesture. Returns the nodes that were moved. */
  public moveSelected(model: NodeModel, direction: Point, accelerated: boolean): NodeModel[] {
    if (!model.selected() || !model.draggable()) return [];
    const step = KEYBOARD_MOVE_STEP * (accelerated ? 4 : 1);
    const nodes = this.getDragNodes(model);
    const changes: GeometryChange[] = nodes.map((node) => ({
      id: node.rawNode.id,
      point: { x: node.point().x + direction.x * step, y: node.point().y + direction.y * step },
    }));
    return this.pipeline.runOneShot('move', 'keyboard', changes, 'core', model.rawNode.id) ? nodes : [];
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
   * Node drag behavior. Every candidate position goes through the geometry pipeline as a move intent of one
   * gesture session, so a feature can transform or veto it before it reaches the node's point signal.
   */
  private getDragBehavior(model: NodeModel, element: Element) {
    let startEvent: MouseEvent | TouchEvent;
    let activated = false;
    let vetoed = false;
    let threshold = 0;
    let dragNodes: NodeModel[] = [];
    let offsets: Point[] = [];
    let session: GestureSession | null = null;
    let lastClient: Point = { x: 0, y: 0 };
    const pointer = signal<Point | null>(null);
    let viewportSub: Subscription | null = null;
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
      if (isGroupNode(model) && this.keyboardService.isActiveModifier('selection')) {
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

      // A handle starts a connection instead of a drag, unless a drag handle inside it is the closer ancestor
      const nearest =
        event.target instanceof Element ? event.target.closest('.vflow-handle, .vflow-drag-handle') : null;
      if (nearest?.classList.contains('vflow-handle')) {
        return false;
      }

      // if there is at least one drag handle, we should check if we are dragging it
      if (model.dragHandlesCount()) {
        return nearest !== null;
      }

      return true;
    };

    /** The candidate position of every dragged node for the pointer's current flow position. */
    const candidates = (): GeometryChange[] => {
      const flow = this.getFlowPoint(lastClient, getPaneRect());
      pointer.set(flow);
      return dragNodes.map((node, index) => ({
        id: node.rawNode.id,
        point: { x: round(flow.x + offsets[index].x), y: round(flow.y + offsets[index].y) },
      }));
    };

    const update = () => {
      if (!session) return;
      this.pipeline.run({ kind: 'move', phase: 'update', session, origin: 'core', changes: candidates() });
    };

    /** Returns whether the gesture was allowed to start. */
    const activate = (): boolean => {
      dragNodes = this.getDragNodes(model);
      startTrackingPaneGeometry();
      // d3-drag event.x/y are screen px (not auto-scaled like the old SVG CTM),
      // so recompute the pointer position in flow space.
      lastClient = eventClientPoint(startEvent);
      const flow = this.getFlowPoint(lastClient, getPaneRect());
      offsets = dragNodes.map((node) => ({ x: node.point().x - flow.x, y: node.point().y - flow.y }));
      pointer.set(flow);
      session = createPointerSession(model, dragNodes, pointer.asReadonly());

      const changes = dragNodes.map((node) => ({ id: node.rawNode.id, point: { ...node.point() } }));
      if (!this.pipeline.run({ kind: 'move', phase: 'start', session, origin: 'core', changes })) {
        stopTrackingPaneGeometry();
        session = null;
        return false;
      }

      activated = true;
      dragNodes.forEach((node) => node.dragging.set(true));
      this.pipeline.beginSession(session);
      this.flowStatusService.setNodeDragStartStatus(model, session);
      // A pan while the pointer is still (auto-pan) moves flow space under it: re-evaluate the same client point.
      viewportSub = this.viewportPans$().subscribe(() => update());
      return true;
    };

    const behavior = drag()
      .filter(filterCondition)
      .on('start', (event: DragEvent) => {
        startEvent = event.sourceEvent;
        activated = false;
        vetoed = false;
        threshold = this.settingsService.nodeDragThreshold();
        behavior.clickDistance(threshold);
        if (threshold === 0) vetoed = !activate();
      })

      .on('drag', (event: DragEvent) => {
        if (vetoed) return;
        const starting = !activated;
        if (!activated) {
          const start = eventClientPoint(startEvent);
          const current = eventClientPoint(event.sourceEvent);
          if (Math.hypot(current.x - start.x, current.y - start.y) <= threshold) return;
          if (!activate()) {
            vetoed = true;
            return;
          }
        }
        lastClient = eventClientPoint(event.sourceEvent);
        update();
        if (!starting && session) this.flowStatusService.setNodeDragStatus(model, session);
      })

      .on('end', () => {
        if (!activated || !session) return;
        const ending = session;
        activated = false;
        viewportSub?.unsubscribe();
        viewportSub = null;

        const changes = this.pipeline.currentGeometry(ending);
        if (!this.pipeline.run({ kind: 'move', phase: 'end', session: ending, origin: 'core', changes })) {
          this.pipeline.apply(this.pipeline.initialGeometry(ending));
        }

        stopTrackingPaneGeometry();
        dragNodes.forEach((node) => node.dragging.set(false));
        this.flowStatusService.setNodeDragEndStatus(model, ending);
        this.pipeline.endSession();
        session = null;
        pointer.set(null);
      });

    return behavior;
  }

  /** Pans of the viewport (not zooms) while a drag is active. */
  private viewportPans$() {
    return toObservable(this.viewportService.readableViewport, { injector: this.injector }).pipe(
      skip(1), // Skip initial value
      pairwise(),
      filter(
        ([prev, next]) => prev.zoom === next.zoom && (prev.x !== next.x || prev.y !== next.y), // Pan only, not wheel zoom (x/y+k change together)
      ),
    );
  }

  /**
   * Convert a client point into flow coordinates,
   * flow = (client - paneRect - {x,y}) / zoom.
   */
  private getFlowPoint(client: Point, paneRect: DOMRectReadOnly): Point {
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
}

function createPointerSession(
  initiator: NodeModel,
  nodes: readonly NodeModel[],
  pointer: GestureSession['pointer'],
): GestureSession {
  const initial = new Map<string, Rect>();
  for (const node of nodes) {
    initial.set(node.rawNode.id, { ...node.point(), width: node.width(), height: node.height() });
  }
  return {
    id: id(),
    source: 'pointer',
    initiator: initiator.rawNode.id,
    nodes: nodes.map((node) => node.rawNode.id),
    initial,
    pointer,
  };
}
