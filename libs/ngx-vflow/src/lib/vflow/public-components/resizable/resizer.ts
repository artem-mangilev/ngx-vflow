import { NodeModel } from '../../models/node.model';
import { Point } from '../../interfaces/point.interface';
import { clientToFlowPosition } from '../../utils/coordinates';
import { align } from '../../utils/align-number';
import { createPointerDrag } from '../../gestures/pointer-drag';
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

/**
 * Converts the client position of a pointer into flow coordinates and snaps it to the grid.
 */
function getPointerPosition(
  client: Point,
  viewport: { x: number; y: number; zoom: number },
  snapGrid: [number, number],
  containerBounds: DOMRect | null,
) {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

interface ResizeGesture {
  start(event: ResizeDragEvent, client: Point): void;
  move(event: ResizeDragEvent, client: Point): void;
  end(event: ResizeDragEvent): void;
}

/**
 * Attaches a resize gesture to a single resize control element.
 * Recomputes the node dimensions/position on every pointer move via {@link getDimensionsAfterResize}.
 *
 * The parameters of the latest {@link ResizerInstance.update} apply to the next gesture; a gesture in progress keeps
 * the parameters it started with.
 */
export function createResizer({ domNode, getStoreItems, onChange, onEnd }: ResizerParams): ResizerInstance {
  let createGesture: (() => ResizeGesture) | null = null;
  let gesture: ResizeGesture | null = null;

  const finish = (event: PointerEvent) => {
    const current = gesture;
    gesture = null;
    current?.end({ sourceEvent: event });
  };

  const drag = createPointerDrag(domNode, {
    // Primary button only, no ctrl+click (context menu on macOS)
    filter: (event) => createGesture !== null && event.button === 0 && !event.ctrlKey,
    capture: true,
    clickDistance: () => 0,
    stopCompatibilityEvents: true,
    onStart: ({ event, point }) => {
      gesture = createGesture!();
      gesture.start({ sourceEvent: event }, point);
    },
    onMove: ({ event, point }) => gesture?.move({ sourceEvent: event }, point),
    onEnd: ({ event }) => finish(event),
    onCancel: ({ event }) => finish(event),
  });

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
    createGesture = () => createResizeGesture();

    function createResizeGesture(): ResizeGesture {
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

      return {
        start: (event: ResizeDragEvent, client: Point) => {
          const { model, viewport, snapGrid, nodeOrigin, paneDomNode } = getStoreItems();
          node = model;

          containerBounds = paneDomNode?.getBoundingClientRect() ?? null;
          const { xSnapped, ySnapped } = getPointerPosition(client, viewport, snapGrid, containerBounds);

          prevValues = {
            width: node.width(),
            height: node.height(),
            x: node.point().x,
            y: node.point().y,
          };

          // A node can start outside its boundaries, e.g. an explicit size below the CSS min-size. The resize math
          // assumes an in-range start; growing from the unclamped size would subtract the gap from the pointer
          // distance. prevValues keep the real size so the first move always writes the clamped result.
          const startWidth = clamp(prevValues.width, boundaries.minWidth, boundaries.maxWidth);
          const startHeight = clamp(prevValues.height, boundaries.minHeight, boundaries.maxHeight);

          startValues = {
            ...prevValues,
            width: startWidth,
            height: startHeight,
            pointerX: xSnapped,
            pointerY: ySnapped,
            aspectRatio: startWidth / startHeight,
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
        },
        move: (event: ResizeDragEvent, client: Point) => {
          const { viewport, snapGrid, nodeOrigin } = getStoreItems();
          const pointerPosition = getPointerPosition(client, viewport, snapGrid, containerBounds);

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

          const nextValues = { ...prevValues };

          if (isXPosChange || isYPosChange || nodeOrigin[0] === 1 || nodeOrigin[1] === 1) {
            change.x = isXPosChange ? x : nextValues.x;
            change.y = isYPosChange ? y : nextValues.y;

            nextValues.x = change.x;
            nextValues.y = change.y;

            /*
             * when top/left changes, correct the relative positions of child nodes
             * so that they stay in the same position
             */
            if (childNodes.length > 0) {
              const xChange = x - prevX;
              const yChange = y - prevY;

              for (const childNode of childNodes) {
                childChanges.push({
                  model: childNode.model,
                  position: {
                    x: childNode.position.x - xChange + nodeOrigin[0] * (width - prevWidth),
                    y: childNode.position.y - yChange + nodeOrigin[1] * (height - prevHeight),
                  },
                });
              }
            }
          }

          if (isWidthChange || isHeightChange) {
            change.width =
              isWidthChange && (!resizeDirection || resizeDirection === 'horizontal') ? width : nextValues.width;
            change.height =
              isHeightChange && (!resizeDirection || resizeDirection === 'vertical') ? height : nextValues.height;
            nextValues.width = change.width;
            nextValues.height = change.height;
          }

          const direction = getResizeDirection({
            width: nextValues.width,
            prevWidth,
            height: nextValues.height,
            prevHeight,
            affectsX: controlDirection.affectsX,
            affectsY: controlDirection.affectsY,
          });

          const params = { ...nextValues, direction };

          const callResize = shouldResize?.(event, params);

          if (callResize === false) {
            return;
          }
          prevValues = nextValues;
          if (childChanges.length) childNodes = childChanges;
          resizeDetected = true;

          onResize?.(event, params);
          onChange(change, childChanges);
        },
        end: (event: ResizeDragEvent) => {
          if (!resizeDetected) {
            return;
          }

          onResizeEnd?.(event, { ...prevValues });
          onEnd?.({ ...prevValues });

          resizeDetected = false;
        },
      };
    }
  }

  function destroy() {
    drag.destroy();
    createGesture = null;
  }

  return {
    update,
    destroy,
  };
}
