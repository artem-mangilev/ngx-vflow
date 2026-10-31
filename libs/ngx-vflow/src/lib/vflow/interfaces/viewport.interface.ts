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
