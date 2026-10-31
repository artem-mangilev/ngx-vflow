import { Injectable, NgZone, OnDestroy, WritableSignal, effect, inject, signal, untracked } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { getNodesFlowBounds } from '../utils/nodes';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowRenderingService } from './flow-rendering.service';
import { clamp, getViewportForBounds } from '../utils/viewport';
import { FlowSettingsService } from './flow-settings.service';
import { FitViewOptions } from '../interfaces/fit-view-options.interface';
import { NodeModel } from '../models/node.model';
import { Subject } from 'rxjs';
import { isDefined } from '../utils/is-defined';
import { Point } from '../interfaces/point.interface';
import { placeFlowPoint, zoomAround } from '../gestures/viewport-transform';
import { ViewportAnimation, animateViewport } from '../gestures/viewport-animation';

/** Multiplicative zoom step of the zoom keys and of `zoomIn` / `zoomOut`. */
export const ZOOM_STEP = 1.2;

/**
 * A programmatic viewport change. `target` gives the state it leads to from `from`, the state where the previous
 * change leads, with `center` the pane center; `null` when there is nothing to change. `done` reports whether the
 * viewport reached the target.
 */
interface ViewportChange {
  target: (from: ViewportState, center: Point) => ViewportState | null;
  duration: number;
  done: (reached: boolean) => void;
}

/** Where a gesture of the viewport started and ended. */
export interface ViewportGesture {
  start: ViewportState;
  end: ViewportState;
}

/**
 * The viewport: its state, the programmatic changes and their animation, and the lifecycle of the gestures that
 * change it. The pane's input gestures (`viewportGestures`) write the state and report their gestures here; every
 * change of the viewport belongs to a gesture, and nested gestures, such as a programmatic change during a drag,
 * report one start and one end.
 */
@Injectable()
export class ViewportService implements OnDestroy {
  private entitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private flowRendering = inject(FlowRenderingService);
  private zone = inject(NgZone);

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

  /** Emits the viewport each time a gesture or a programmatic change ends. */
  public readonly viewportChangeEnd$ = new Subject<ViewportState>();

  /** Changes requested before the pane exists wait for it. */
  private pendingChanges: ViewportChange[] = [];
  private destroyed = false;

  private activeGestures = 0;
  private gestureStart: ViewportState | null = null;

  private animation: ViewportAnimation | null = null;
  /** Where the animation in progress leads; a programmatic change continues from there. */
  private animationTarget: ViewportState | null = null;
  /** Reports the end of the programmatic change the animation in progress belongs to. */
  private animationDone: ((reached: boolean) => void) | null = null;
  /** What an input gesture in progress does when a change takes over; see {@link onTakeOver}. */
  private yieldInput: (() => void) | null = null;

  constructor() {
    effect(() => {
      if (!this.flowRendering.pane()) return;
      untracked(() => {
        for (const change of this.pendingChanges.splice(0)) this.apply(change);
      });
    });
  }

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
      return getViewportForBounds(getNodesFlowBounds(nodes), { width, height }, { minZoom, maxZoom, padding });
    }, options.duration ?? 0);
  }

  /**
   * Registers what an input gesture in progress does when a programmatic change takes over, for example the wheel
   * zoom landing on its target; returns the function that unregisters it.
   */
  public onTakeOver(land: () => void): () => void {
    this.yieldInput = land;

    return () => {
      if (this.yieldInput === land) this.yieldInput = null;
    };
  }

  /** Begins a gesture of the viewport; a gesture within another one is part of it. */
  public beginGesture(): void {
    if (this.activeGestures++ === 0) this.gestureStart = untracked(this.readableViewport);
  }

  /**
   * Ends a gesture. Once the outermost one ends, reports the end of the change and returns where the gesture
   * started and ended; `null` while an enclosing gesture goes on.
   */
  public endGesture(): ViewportGesture | null {
    if (this.activeGestures === 0 || --this.activeGestures > 0) return null;
    const end = untracked(this.readableViewport);
    const start = this.gestureStart ?? end;
    this.gestureStart = null;
    if (this.destroyed) return null;

    // Gestures run outside Angular; the end of a change reaches the application.
    this.zone.run(() => this.viewportChangeEnd$.next(end));

    return { start, end };
  }

  /**
   * Animates the viewport to `to`; `anchor` is the pane point the zoom animates around. Resolves with whether the
   * viewport reached the target, `false` when another change or a gesture interrupted the animation first.
   */
  public animate(to: ViewportState, duration: number, anchor: () => Point): Promise<boolean> {
    return new Promise((done) => this.run(to, duration, anchor, done));
  }

  /** Stops the animation in progress, which reports that it did not reach its target, and lands the input gesture. */
  public interruptAnimation(): void {
    const animation = this.animation;
    const done = this.animationDone;
    this.animation = null;
    this.animationTarget = null;
    this.animationDone = null;
    animation?.interrupt();
    done?.(false);
    this.yieldInput?.();
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this.interruptAnimation();
    for (const change of this.pendingChanges.splice(0)) change.done(false);
  }

  private request(target: ViewportChange['target'], duration: number): Promise<boolean> {
    return new Promise((done) => {
      const change = { target, duration, done };
      if (untracked(this.flowRendering.pane)) untracked(() => this.apply(change));
      else this.pendingChanges.push(change);
    });
  }

  /**
   * A change continues from where the previous one leads: the target of an animation in progress, or the viewport.
   * It reports that it reached its target once it lands there; an interrupted animation reports that it did not.
   */
  private apply({ target, duration, done }: ViewportChange) {
    const previousTarget = this.animationTarget;
    this.interruptAnimation();
    const to = target(previousTarget ?? untracked(this.readableViewport), this.paneCenter());
    if (!to) {
      done(false);
      return;
    }

    if (duration > 0) {
      this.run(to, duration, () => this.paneCenter(), done);
    } else {
      this.beginGesture();
      this.readableViewport.set(to);
      this.endGesture();
      done(true);
    }
  }

  private run(to: ViewportState, duration: number, anchor: () => Point, done: (reached: boolean) => void) {
    this.interruptAnimation();
    const pane = untracked(this.flowRendering.pane);
    const animation: ViewportAnimation = this.zone.runOutsideAngular(() =>
      animateViewport({
        duration,
        current: () => untracked(this.readableViewport),
        target: () => to,
        anchor,
        size: () => (pane ? Math.max(pane.clientWidth, pane.clientHeight) : 0),
        onStart: () => this.beginGesture(),
        onFrame: (state) => this.readableViewport.set(state),
        onEnd: () => {
          const reached = this.animation === animation;
          if (reached) {
            this.animation = null;
            this.animationTarget = null;
            this.animationDone = null;
          }
          this.endGesture();
          if (reached) done(true);
        },
      }),
    );
    this.animation = animation;
    this.animationTarget = to;
    this.animationDone = done;
  }

  private paneCenter(): Point {
    const pane = untracked(this.flowRendering.pane);
    return pane ? { x: pane.clientWidth / 2, y: pane.clientHeight / 2 } : { x: 0, y: 0 };
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
