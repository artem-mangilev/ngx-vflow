import { SpacePoint, Point } from '../interfaces/point.interface';
import { NodeModel } from '../models/node.model';

/**
 * @todo handle regular nodes
 *
 * @param point global point in flow coordinates
 * @param groups sorted array of groups
 * @returns
 */
export function getSpacePoints(point: Point, groups: NodeModel[]): SpacePoint[] {
  const result: SpacePoint[] = [];

  for (const group of groups) {
    const { x, y } = group.globalPoint();

    result.push({
      x: point.x - x,
      y: point.y - y,
      spaceNodeId: group.rawNode.id,
    });
  }

  result.reverse();

  // TODO: spread does not work, because the point is SVGPoint
  result.push({ spaceNodeId: null, x: point.x, y: point.y });

  return result;
}
