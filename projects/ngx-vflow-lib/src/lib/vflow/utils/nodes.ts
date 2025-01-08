import { Box } from '../interfaces/box';
import { Rect } from '../interfaces/rect';
import { NodeModel } from '../models/node.model';

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

function nodeToBox(node: NodeModel): Box {
  return {
    x: node.point().x,
    y: node.point().y,
    x2: node.point().x + node.size().width,
    y2: node.point().y + node.size().height,
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
