import { Rect } from '../interfaces/rect';
import { ViewportState } from '../interfaces/viewport.interface';

export function getViewportForBounds(
  bounds: Rect,
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number,
  padding: number,
): ViewportState {
  const xZoom = width / (bounds.width * (1 + padding));
  const yZoom = height / (bounds.height * (1 + padding));
  const zoom = Math.min(xZoom, yZoom);
  const clampedZoom = clamp(zoom, minZoom, maxZoom);
  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;
  const x = width / 2 - boundsCenterX * clampedZoom;
  const y = height / 2 - boundsCenterY * clampedZoom;

  return { x, y, zoom: clampedZoom };
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the visible area bounds in world coordinates based on the current viewport state
 *
 * @param viewport Current viewport state (x, y, zoom)
 * @param flowWidth Width of the flow container
 * @param flowHeight Height of the flow container
 * @returns Rect representing the visible area in world coordinates
 */
export function getViewportBounds(viewport: ViewportState, flowWidth: number, flowHeight: number): Rect {
  const zoom = viewport.zoom;

  return {
    x: -viewport.x / zoom,
    y: -viewport.y / zoom,
    width: flowWidth / zoom,
    height: flowHeight / zoom,
  };
}

/**
 * Checks if a rectangle intersects with the viewport's visible area
 *
 * @param rect Rectangle to check (in world coordinates)
 * @param viewport Current viewport state
 * @param flowWidth Width of the flow container
 * @param flowHeight Height of the flow container
 * @returns true if the rectangle intersects with the viewport, false otherwise
 */
export function isRectInViewport(rect: Rect, viewport: ViewportState, flowWidth: number, flowHeight: number): boolean {
  const viewportBounds = getViewportBounds(viewport, flowWidth, flowHeight);

  // Check if rectangles intersect using standard rectangle intersection test
  // No intersection if: rect is completely to the left, right, above, or below the viewport
  const isNotIntersecting =
    rect.x + rect.width < viewportBounds.x || // Rect is completely to the left
    rect.x > viewportBounds.x + viewportBounds.width || // Rect is completely to the right
    rect.y + rect.height < viewportBounds.y || // Rect is completely above
    rect.y > viewportBounds.y + viewportBounds.height; // Rect is completely below

  return !isNotIntersecting;
}

/**
 * Checks if a line segment intersects with the viewport's visible area
 *
 * @param startPoint Start point of the line segment
 * @param endPoint End point of the line segment
 * @param viewport Current viewport state
 * @param flowWidth Width of the flow container
 * @param flowHeight Height of the flow container
 * @returns true if the line segment intersects with the viewport, false otherwise
 */
export function isLineInViewport(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  viewport: ViewportState,
  flowWidth: number,
  flowHeight: number,
): boolean {
  const minX = Math.min(startPoint.x, endPoint.x);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxY = Math.max(startPoint.y, endPoint.y);

  const lineRect = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  return isRectInViewport(lineRect, viewport, flowWidth, flowHeight);
}
