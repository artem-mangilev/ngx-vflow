import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';
import { Position } from '../types/position.type';

export interface NodeEndpoint {
  point: Point;
  position: Position;
}

/**
 * Endpoint of an edge on a node for the `auto` and `center` handle positions. The side is the one that faces
 * `towards` along the dominant axis; `auto` takes the middle of that side, `center` the node center.
 */
export function getNodeEndpoint(node: Rect, towards: Point, position: 'auto' | 'center'): NodeEndpoint {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const dx = towards.x - center.x;
  const dy = towards.y - center.y;
  const side: Position = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : dy > 0 ? 'bottom' : 'top';

  if (position === 'center') {
    return { point: center, position: side };
  }

  switch (side) {
    case 'left':
      return { point: { x: node.x, y: center.y }, position: side };
    case 'right':
      return { point: { x: node.x + node.width, y: center.y }, position: side };
    case 'top':
      return { point: { x: center.x, y: node.y }, position: side };
    case 'bottom':
      return { point: { x: center.x, y: node.y + node.height }, position: side };
  }
}
