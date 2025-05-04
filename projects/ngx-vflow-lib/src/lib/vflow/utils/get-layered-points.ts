import { LayeredPoint, Point } from '../interfaces/point.interface';
import { NodeModel } from '../models/node.model';

/**
 * @todo handle regular nodes
 *
 * @param point global point in flow coordinates
 * @param groups sorted array of groups
 * @returns
 */
export function getLayeredPoints(point: Point, groups: NodeModel[]): LayeredPoint[] {
  const result: LayeredPoint[] = [];

  for (const group of groups) {
    const { x, y } = group.globalPoint();

    if (point.x >= x && point.x <= x + group.width() && point.y >= y && point.y <= y + group.height()) {
      result.push({
        x: point.x - x,
        y: point.y - y,
        nodeId: group.rawNode.id,
      });
    }
  }

  result.reverse();

  // TODO: spread does not work, because the point is SVGPoint
  result.push({ nodeId: null, x: point.x, y: point.y });

  return result;
}
