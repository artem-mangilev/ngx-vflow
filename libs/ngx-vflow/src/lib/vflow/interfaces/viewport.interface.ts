import { Point } from './point.interface';

export interface ViewportState extends Point {
  zoom: number;
}

/** Options of the programmatic viewport methods. */
export interface ViewportOptions {
  /** Duration of the animated transition in milliseconds; `0`, the default, changes the viewport at once. */
  duration?: number;
}

/** Options of {@link VflowComponent.setCenter}. */
export interface SetCenterOptions extends ViewportOptions {
  /** Zoom to center at; the current one when omitted. */
  zoom?: number;
}

/**
 * A programmatic viewport change. `target` gives the state it leads to from `from`, the state where the previous
 * change leads, with `center` the pane center; `null` when there is nothing to change. `done` reports whether the
 * viewport reached the target.
 */
export interface ViewportChange {
  target: (from: ViewportState, center: Point) => ViewportState | null;
  duration: number;
  done: (reached: boolean) => void;
}
