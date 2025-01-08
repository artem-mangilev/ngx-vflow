import { ViewportChangeType } from '../types/viewport-change-type.type';
import { Point } from './point.interface';

export interface ViewportState extends Point {
  zoom: number;
}

export interface WritableViewport {
  changeType: ViewportChangeType;
  state: Partial<ViewportState>;
  duration: number;
}
