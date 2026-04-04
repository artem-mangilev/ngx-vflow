import { IntersectingNodesOptions } from '../interfaces/intersecting-nodes-options.interface';
import { Rect } from '../interfaces/rect';
import { NodeModel } from '../models/node.model';
import { getBoundsOfRects, getOverlappingArea } from './rect';

export function getNodesBounds(nodes: NodeModel[]): Rect {
  return getBoundsOfRects(nodes.map((node) => nodeToLocalRect(node)));
}

/**
 * Union of node rectangles in flow (world) space — same space as SVG transforms and viewport math.
 * Use for fitView, minimap, etc. For bounds relative to a parent (e.g. children inside a group during resize), use {@link getNodesBounds}.
 */
export function getNodesFlowBounds(nodes: NodeModel[]): Rect {
  return getBoundsOfRects(nodes.map((node) => nodeToRect(node)));
}

export function getIntesectingNodes(
  nodeId: string,
  nodes: NodeModel[],
  options?: IntersectingNodesOptions,
): NodeModel[] {
  const node = nodes.find((n) => n.rawNode.id === nodeId);
  if (!node) return [];

  const nodeRect = nodeToRect(node);

  return nodes.filter((currentNode) => {
    if (currentNode.rawNode.id === nodeId) return false;

    const currentRect = nodeToRect(currentNode);
    const overlappingArea = getOverlappingArea(currentRect, nodeRect);

    if (options?.partially) {
      return overlappingArea > 0;
    }

    return overlappingArea >= nodeRect.width * nodeRect.height;
  });
}

function nodeToLocalRect(node: NodeModel): Rect {
  return {
    x: node.point().x,
    y: node.point().y,
    width: node.width(),
    height: node.height(),
  };
}

export function nodeToRect(node: NodeModel): Rect {
  return {
    x: node.globalPoint().x,
    y: node.globalPoint().y,
    width: node.width(),
    height: node.height(),
  };
}
