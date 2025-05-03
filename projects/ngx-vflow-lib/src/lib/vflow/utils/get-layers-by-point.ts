import { FlowLayer } from '../interfaces/flow-layer.interface';
import { Point } from '../interfaces/point.interface';
import { NodeModel } from '../models/node.model';

/**
 * @todo handle regular nodes
 *
 * @param point global point in flow coordinates
 * @param groups sorted array of groups
 * @returns
 */
export function getLayersByPoint(point: Point, groups: NodeModel[]): FlowLayer[] {
  const result: FlowLayer[] = [];

  for (const group of groups) {
    const { x, y } = group.globalPoint();

    if (point.x >= x && point.x <= x + group.width() && point.y >= y && point.y <= y + group.height()) {
      result.push({
        nodeId: group.rawNode.id,
        // convert point to group coordinates
        point: {
          x: point.x - x,
          y: point.y - y,
        },
      });
    }
  }

  result.reverse();

  result.push({ nodeId: null, point });

  return result;
}
