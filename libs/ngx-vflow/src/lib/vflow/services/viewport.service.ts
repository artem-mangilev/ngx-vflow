import { Injectable, OnDestroy, WritableSignal, inject, signal, untracked } from '@angular/core';
import { ViewportChange, ViewportState } from '../interfaces/viewport.interface';
import { getNodesFlowBounds } from '../utils/nodes';
import { FlowEntitiesService } from './flow-entities.service';
import { clamp, getViewportForBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';
import { FitViewOptions } from '../interfaces/fit-view-options.interface';
import { NodeModel } from '../models/node.model';
import { Subject } from 'rxjs';
import { isDefined } from '../utils/is-defined';
import { Point } from '../interfaces/point.interface';
import { placeFlowPoint, zoomAround } from '../gestures/viewport-transform';

/** Multiplicative zoom step of the zoom keys and of `zoomIn` / `zoomOut`. */
export const ZOOM_STEP = 1.2;

@Injectable()
export class ViewportService implements OnDestroy {
  private entitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);

  /**
   * The identity viewport: no translation, zoom 1.
   *
   * @returns default viewport value
   */
  private static getDefaultViewport(): ViewportState {
    return { zoom: 1, x: 0, y: 0 };
  }

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - programmatic changes requested through {@link change} and the other change methods
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport());

  public readonly viewportChangeEnd$ = new Subject<void>();

  private applyChange: ((change: ViewportChange) => void) | null = null;
  private pendingChanges: ViewportChange[] = [];

  /**
   * Requests a programmatic viewport change. The values it gives replace the current ones; zoom alone scales around
   * the pane center.
   *
   * Changes apply at once and in order, each from where the previous one leads, so that consecutive calls compose;
   * zoom keeps to the limits. Changes requested before the pane exists wait for it. The returned promise settles
   * when the change ends: `true` when the viewport reached the target, `false` when another change or a gesture
   * interrupted it first.
   *
   * Applying a change reads the viewport and the zoom limits untracked, so that a call from an effect does not make
   * the effect depend on the viewport it changes.
   */
  public change(state: Partial<ViewportState>, duration = 0): Promise<boolean> {
    return this.request((from, center) => {
      const zoom = this.clampZoom(state.zoom ?? from.zoom);
      return isDefined(state.x) || isDefined(state.y)
        ? { x: state.x ?? from.x, y: state.y ?? from.y, zoom }
        : zoomAround(from, zoom, center);
    }, duration);
  }

  /** Multiplies the zoom around the pane center; see {@link change}. */
  public zoomBy(factor: number, duration = 0): Promise<boolean> {
    return this.request((from, center) => zoomAround(from, this.clampZoom(from.zoom * factor), center), duration);
  }

  /** Puts a flow point in the pane center, at the given zoom or the current one; see {@link change}. */
  public setCenter(point: Point, zoom: number | undefined, duration = 0): Promise<boolean> {
    return this.request((from, center) => placeFlowPoint(this.clampZoom(zoom ?? from.zoom), center, point), duration);
  }

  /**
   * Fits the nodes into the pane; see {@link change}. The promise settles with `false` when there is nothing to fit:
   * no nodes, or a pane without size.
   */
  public fitView(options: FitViewOptions = {}): Promise<boolean> {
    const padding = options.padding ?? 0.1;
    if (
      ![padding, options.minZoom ?? 1, options.maxZoom ?? 1].every(Number.isFinite) ||
      padding <= -1 ||
      (options.minZoom ?? 1) <= 0 ||
      (options.maxZoom ?? 1) <= 0
    ) {
      throw new RangeError('fitView received invalid padding, minZoom, or maxZoom');
    }

    return this.request(() => {
      const nodes = this.getBoundsNodes(options.nodes ?? []);
      const width = this.flowSettingsService.computedFlowWidth();
      const height = this.flowSettingsService.computedFlowHeight();
      if (!nodes.length || width <= 0 || height <= 0) return null;

      const maxZoom = this.clampZoom(options.maxZoom ?? Infinity);
      const minZoom = Math.min(this.clampZoom(options.minZoom ?? 0), maxZoom);
      return getViewportForBounds(getNodesFlowBounds(nodes), width, height, minZoom, maxZoom, padding);
    }, options.duration ?? 0);
  }

  /** Registers the pane that applies programmatic changes; returns the function that unregisters it. */
  public connect(apply: (change: ViewportChange) => void): () => void {
    this.applyChange = apply;
    untracked(() => {
      for (const change of this.pendingChanges.splice(0)) apply(change);
    });

    return () => {
      if (this.applyChange === apply) this.applyChange = null;
    };
  }

  public ngOnDestroy(): void {
    for (const change of this.pendingChanges.splice(0)) change.done(false);
  }

  public triggerViewportChangeEvent(type: 'end') {
    if (type === 'end') {
      this.viewportChangeEnd$.next();
    }
  }

  private request(target: ViewportChange['target'], duration: number): Promise<boolean> {
    return new Promise((done) => {
      const change = { target, duration, done };
      const apply = this.applyChange;
      if (apply) untracked(() => apply(change));
      else this.pendingChanges.push(change);
    });
  }

  private clampZoom(zoom: number) {
    return clamp(zoom, this.flowSettingsService.minZoom(), this.flowSettingsService.maxZoom());
  }

  private getBoundsNodes(nodeIds: string[]) {
    return !nodeIds?.length
      ? // If nodes option not passed or the list is empty, then get fit the whole view
        this.entitiesService.nodes()
      : // Otherwise fit to specific nodes
        nodeIds
          .map((nodeId) => this.entitiesService.nodeByIdMap().get(nodeId))
          .filter((node): node is NodeModel => !!node);
  }
}
