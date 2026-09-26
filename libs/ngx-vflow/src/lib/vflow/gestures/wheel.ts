import { Point } from '../interfaces/point.interface';

type WheelDelta = Pick<WheelEvent, 'deltaX' | 'deltaY' | 'deltaMode' | 'ctrlKey'>;

/**
 * Multiplicative zoom change of one wheel event. Pixel deltas scale by 0.002, line deltas by 0.05 and page deltas
 * by 1; pinch, which browsers report as a wheel event with `ctrlKey`, is ten times more sensitive.
 */
export function wheelZoomFactor(event: WheelDelta): number {
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 0.05 : event.deltaMode ? 1 : 0.002;
  return Math.pow(2, -event.deltaY * unit * (event.ctrlKey ? 10 : 1));
}

/** Pane-space translation of one scroll-pan wheel event; a line is 16 pixels and a page is the pane height. */
export function wheelPanDelta(event: WheelDelta, paneHeight: number): Point {
  const unit =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? paneHeight : 1;
  return { x: -event.deltaX * unit, y: -event.deltaY * unit };
}
