import { Node } from '../interfaces/node.interface';
import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { getNodeFlowPosition } from './node-position';

export interface ClientTransformOptions {
  /** Current flow translation and zoom. */
  viewport: ViewportState;
  /** Top-left position of the flow container in client space. */
  containerPosition: Point;
}

/** Gets a node's position relative to another node, or in flow space when `spaceNodeId` is null. */
export function getNodePositionInSpace(
  nodeId: string,
  spaceNodeId: string | null,
  nodes: readonly Node[],
): Point | undefined {
  const nodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const flowPosition = nodeSpaceToFlowPosition({ x: 0, y: 0 }, nodeId, nodeLookup);

  if (!flowPosition || spaceNodeId === null) return flowPosition;

  return flowToNodeSpacePosition(flowPosition, spaceNodeId, nodeLookup);
}

/** Converts a DOM client-space position to flow space. */
export function clientToFlowPosition(point: Point, { viewport, containerPosition }: ClientTransformOptions): Point {
  validateZoom(viewport.zoom);

  return {
    x: (point.x - containerPosition.x - viewport.x) / viewport.zoom,
    y: (point.y - containerPosition.y - viewport.y) / viewport.zoom,
  };
}

/** Converts a flow-space position to DOM client space. */
export function flowToClientPosition(point: Point, { viewport, containerPosition }: ClientTransformOptions): Point {
  validateZoom(viewport.zoom);

  return {
    x: containerPosition.x + viewport.x + point.x * viewport.zoom,
    y: containerPosition.y + viewport.y + point.y * viewport.zoom,
  };
}

/** Converts a position relative to `spaceNodeId` into flow space. */
export function nodeSpaceToFlowPosition(
  point: Point,
  spaceNodeId: string,
  nodeLookup: ReadonlyMap<string, Node>,
): Point | undefined {
  const origin = getNodeFlowPosition(spaceNodeId, nodeLookup);
  return origin ? { x: origin.x + point.x, y: origin.y + point.y } : undefined;
}

/** Converts a flow-space position into coordinates relative to `spaceNodeId`. */
export function flowToNodeSpacePosition(
  point: Point,
  spaceNodeId: string,
  nodeLookup: ReadonlyMap<string, Node>,
): Point | undefined {
  const origin = getNodeFlowPosition(spaceNodeId, nodeLookup);
  return origin ? { x: point.x - origin.x, y: point.y - origin.y } : undefined;
}

function validateZoom(zoom: number): void {
  if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('zoom must be a positive finite number');
}
