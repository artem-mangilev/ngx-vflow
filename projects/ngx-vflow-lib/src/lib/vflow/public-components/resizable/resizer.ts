import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { NodeModel } from '../../models/node.model';
import { Point } from '../../interfaces/point.interface';
import { clientToFlowPosition } from '../../utils/coordinates';
import { align } from '../../utils/align-number';
import { getControlDirection, getDimensionsAfterResize, getResizeDirection } from './resizer-utils';
import {
  ControlPosition,
  CoordinateExtent,
  NodeOrigin,
  OnResize,
  OnResizeEnd,
  OnResizeStart,
  ResizeControlDirection,
  ResizeDragEvent,
  ShouldResize,
} from './resizer-types';

const initPrevValues = { width: 0, height: 0, x: 0, y: 0 };

const initStartValues = {
  ...initPrevValues,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1,
};

export interface ResizerChange {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ResizerChildChange {
  model: NodeModel;
  position: Point;
}

export interface ResizerStoreItems {
  model: NodeModel;
  viewport: { x: number; y: number; zoom: number };
  snapGrid: [number, number];
  nodeOrigin: NodeOrigin;
  paneDomNode: HTMLElement | null;
}

export interface ResizerParams {
  domNode: Element;
  getStoreItems: () => ResizerStoreItems;
  onChange: (change: ResizerChange, childChanges: ResizerChildChange[]) => void;
  onEnd?: (change: Required<ResizerChange>) => void;
}

export interface ResizerUpdateParams {
  controlPosition: ControlPosition;
  boundaries: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  keepAspectRatio: boolean;
  resizeDirection?: ResizeControlDirection;
  onResizeStart?: OnResizeStart;
  onResize?: OnResize;
  onResizeEnd?: OnResizeEnd;
  shouldResize?: ShouldResize;
}

export interface ResizerInstance {
  update: (params: ResizerUpdateParams) => void;
  destroy: () => void;
}

function clientFromEvent(event: MouseEvent | TouchEvent): Point {
  if ('touches' in event && event.touches.length) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  if ('changedTouches' in event && event.changedTouches.length) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }

  const mouseEvent = event as MouseEvent;
  return { x: mouseEvent.clientX, y: mouseEvent.clientY };
}

/**
 * Converts the pointer position of a drag source event into flow coordinates and snaps it to the grid.
 */
function getPointerPosition(
  event: MouseEvent | TouchEvent,
  viewport: { x: number; y: number; zoom: number },
  snapGrid: [number, number],
  containerBounds: DOMRect | null,
) {
  const client = clientFromEvent(event);
  const { x, y } = clientToFlowPosition(client, {
    viewport,
    containerPosition: { x: containerBounds?.left ?? 0, y: containerBounds?.top ?? 0 },
  });

  const [snapX, snapY] = snapGrid;
  const shouldSnap = snapX > 1 || snapY > 1;

  return {
    x,
    y,
    xSnapped: shouldSnap ? align(x, snapX) : x,
    ySnapped: shouldSnap ? align(y, snapY) : y,
  };
}

function nodeToParentExtent(parent: NodeModel): CoordinateExtent {
  return [
    [0, 0],
    [parent.width(), parent.height()],
  ];
}

function nodeToChildExtent(child: NodeModel, node: NodeModel, nodeOrigin: NodeOrigin): CoordinateExtent {
  const x = node.point().x + child.point().x;
  const y = node.point().y + child.point().y;
  const width = child.width() ?? 0;
  const height = child.height() ?? 0;
  const originOffsetX = nodeOrigin[0] * width;
  const originOffsetY = nodeOrigin[1] * height;

  return [
    [x - originOffsetX, y - originOffsetY],
    [x + width - originOffsetX, y + height - originOffsetY],
  ];
}

/**
 * Attaches a d3-drag resize behavior to a single resize control element.
 * Recomputes the node dimensions/position on every drag move via {@link getDimensionsAfterResize}.
 */
export function createResizer({ domNode, getStoreItems, onChange, onEnd }: ResizerParams): ResizerInstance {
  const selection = select(domNode);

  function update({
    controlPosition,
    boundaries,
    keepAspectRatio,
    resizeDirection,
    onResizeStart,
    onResize,
    onResizeEnd,
    shouldResize,
  }: ResizerUpdateParams) {
    let prevValues = { ...initPrevValues };
    let startValues = { ...initStartValues };

    const controlDirection = getControlDirection(controlPosition);

    let node: NodeModel | undefined;
    let containerBounds: DOMRect | null = null;
    let childNodes: ResizerChildChange[] = [];
    let parentExtent: CoordinateExtent | undefined;
    let childExtent: CoordinateExtent | undefined;
    // we only want to trigger onResizeEnd if onResize was actually called
    let resizeDetected = false;

    const dragHandler = drag<Element, unknown>()
      .on('start', (event: ResizeDragEvent) => {
        const { model, viewport, snapGrid, nodeOrigin, paneDomNode } = getStoreItems();
        node = model;

        containerBounds = paneDomNode?.getBoundingClientRect() ?? null;
        const { xSnapped, ySnapped } = getPointerPosition(event.sourceEvent, viewport, snapGrid, containerBounds);

        prevValues = {
          width: node.width(),
          height: node.height(),
          x: node.point().x,
          y: node.point().y,
        };

        startValues = {
          ...prevValues,
          pointerX: xSnapped,
          pointerY: ySnapped,
          aspectRatio: prevValues.width / prevValues.height,
        };

        parentExtent = undefined;
        const parent = node.parent();

        if (parent && node.extent() === 'parent') {
          parentExtent = nodeToParentExtent(parent);
        }

        /*
         * Collect all child nodes to correct their relative positions when top/left changes
         * and determine the smallest extent the node is allowed to resize to.
         */
        childNodes = [];
        childExtent = undefined;

        for (const child of node.children()) {
          childNodes.push({
            model: child,
            position: { ...child.point() },
          });

          if (child.extent() === 'parent') {
            const extent = nodeToChildExtent(child, node, nodeOrigin);

            if (childExtent) {
              childExtent = [
                [Math.min(extent[0][0], childExtent[0][0]), Math.min(extent[0][1], childExtent[0][1])],
                [Math.max(extent[1][0], childExtent[1][0]), Math.max(extent[1][1], childExtent[1][1])],
              ];
            } else {
              childExtent = extent;
            }
          }
        }

        onResizeStart?.(event, { ...prevValues });
      })
      .on('drag', (event: ResizeDragEvent) => {
        const { viewport, snapGrid, nodeOrigin } = getStoreItems();
        const pointerPosition = getPointerPosition(event.sourceEvent, viewport, snapGrid, containerBounds);

        const childChanges: ResizerChildChange[] = [];

        if (!node) {
          return;
        }

        const { x: prevX, y: prevY, width: prevWidth, height: prevHeight } = prevValues;
        const change: ResizerChange = {};

        const { width, height, x, y } = getDimensionsAfterResize(
          startValues,
          controlDirection,
          pointerPosition,
          boundaries,
          keepAspectRatio,
          nodeOrigin,
          parentExtent,
          childExtent,
        );

        const isWidthChange = width !== prevWidth;
        const isHeightChange = height !== prevHeight;

        const isXPosChange = x !== prevX && isWidthChange;
        const isYPosChange = y !== prevY && isHeightChange;

        if (!isXPosChange && !isYPosChange && !isWidthChange && !isHeightChange) {
          return;
        }

        if (isXPosChange || isYPosChange || nodeOrigin[0] === 1 || nodeOrigin[1] === 1) {
          change.x = isXPosChange ? x : prevValues.x;
          change.y = isYPosChange ? y : prevValues.y;

          prevValues.x = change.x;
          prevValues.y = change.y;

          /*
           * when top/left changes, correct the relative positions of child nodes
           * so that they stay in the same position
           */
          if (childNodes.length > 0) {
            const xChange = x - prevX;
            const yChange = y - prevY;

            for (const childNode of childNodes) {
              childNode.position = {
                x: childNode.position.x - xChange + nodeOrigin[0] * (width - prevWidth),
                y: childNode.position.y - yChange + nodeOrigin[1] * (height - prevHeight),
              };
              childChanges.push(childNode);
            }
          }
        }

        if (isWidthChange || isHeightChange) {
          change.width =
            isWidthChange && (!resizeDirection || resizeDirection === 'horizontal') ? width : prevValues.width;
          change.height =
            isHeightChange && (!resizeDirection || resizeDirection === 'vertical') ? height : prevValues.height;
          prevValues.width = change.width;
          prevValues.height = change.height;
        }

        const direction = getResizeDirection({
          width: prevValues.width,
          prevWidth,
          height: prevValues.height,
          prevHeight,
          affectsX: controlDirection.affectsX,
          affectsY: controlDirection.affectsY,
        });

        const nextValues = { ...prevValues, direction };

        const callResize = shouldResize?.(event, nextValues);

        if (callResize === false) {
          return;
        }
        resizeDetected = true;

        onResize?.(event, nextValues);
        onChange(change, childChanges);
      })
      .on('end', (event: ResizeDragEvent) => {
        if (!resizeDetected) {
          return;
        }

        onResizeEnd?.(event, { ...prevValues });
        onEnd?.({ ...prevValues });

        resizeDetected = false;
      });

    selection.call(dragHandler);
  }

  function destroy() {
    selection.on('.drag', null);
  }

  return {
    update,
    destroy,
  };
}
