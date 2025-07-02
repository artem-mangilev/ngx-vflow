import { Box } from '../interfaces/box';
import { IntersectingNodesOptions } from '../interfaces/intersecting-nodes-options.interface';
import { Rect } from '../interfaces/rect';
import { NodeModel } from '../models/node.model';
import { getOverlappingArea } from './get-overlapping-area';

export function getNodesBounds(nodes: NodeModel[]): Rect {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let box: Box = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };

  nodes.forEach((node) => {
    const nodeBox = nodeToBox(node);
    box = getBoundsOfBoxes(box, nodeBox);
  });

  return boxToRect(box);
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

    const overlappingArea = getOverlappingArea(nodeToRect(currentNode), nodeRect);

    if (options?.partially) {
      return overlappingArea > 0;
    }

    return overlappingArea >= nodeRect.width * nodeRect.height;
  });
}

function nodeToBox(node: NodeModel): Box {
  return {
    x: node.point().x,
    y: node.point().y,
    x2: node.point().x + node.size().width,
    y2: node.point().y + node.size().height,
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

function boxToRect({ x, y, x2, y2 }: Box): Rect {
  return {
    x,
    y,
    width: x2 - x,
    height: y2 - y,
  };
}

function getBoundsOfBoxes(box1: Box, box2: Box): Box {
  return {
    x: Math.min(box1.x, box2.x),
    y: Math.min(box1.y, box2.y),
    x2: Math.max(box1.x2, box2.x2),
    y2: Math.max(box1.y2, box2.y2),
  };
}
