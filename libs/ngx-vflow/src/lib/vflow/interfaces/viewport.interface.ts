import { Point } from './point.interface';

export interface ViewportState extends Point {
  zoom: number;
}

/** A programmatic viewport change: the values it gives replace the current ones, animated over `duration` ms. */
export interface ViewportChange {
  state: Partial<ViewportState>;
  duration: number;
}
