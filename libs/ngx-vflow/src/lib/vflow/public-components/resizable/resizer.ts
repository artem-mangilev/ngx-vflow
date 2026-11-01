import { NodeModel } from '../../models/node.model';
import { clamp } from '../../utils/viewport';
import { Point } from '../../interfaces/point.interface';
import { ResizeBounds, getControlDirection, getDimensionsAfterResize, getResizeDirection } from './resizer-utils';
import {
  ControlPosition,
  CoordinateExtent,
  ResizeAxis,
  ResizeChangeParams,
  ResizeDragEvent,
  ResizeParams,
  ShouldResize,
} from './resizer-types';

export interface ResizeOptions {
  node: NodeModel;
  position: ControlPosition;
  bounds: ResizeBounds;
  keepAspectRatio: boolean;
  resizeAxis?: ResizeAxis;
  shouldResize?: ShouldResize;
  onStart: (event: ResizeDragEvent, params: ResizeParams) => void;
  onResize: (event: ResizeDragEvent, params: ResizeChangeParams) => void;
  /** Runs only after a change was applied. */
  onEnd: (event: ResizeDragEvent, params: ResizeParams) => void;
}

/** One resize in progress; `pointer` is the pointer in flow units, snapped to the grid. */
export interface ResizeGesture {
  move(event: ResizeDragEvent, pointer: Point): void;
  end(event: ResizeDragEvent): void;
}

/** The smallest box in the node that keeps every child of a `parent` extent inside. */
function getChildExtent(node: NodeModel): CoordinateExtent | undefined {
  let extent: CoordinateExtent | undefined;

  for (const child of node.children()) {
    if (child.extent() !== 'parent') continue;

    const x = node.point().x + child.point().x;
    const y = node.point().y + child.point().y;
    const box: CoordinateExtent = [
      [x, y],
      [x + child.width(), y + child.height()],
    ];

    extent = extent
      ? [
          [Math.min(box[0][0], extent[0][0]), Math.min(box[0][1], extent[0][1])],
          [Math.max(box[1][0], extent[1][0]), Math.max(box[1][1], extent[1][1])],
        ]
      : box;
  }

  return extent;
}

/**
 * Begins a resize of a node from the press on one of its controls. Every move writes the node point, its size and
 * the positions of its children, which stay in place when the origin moves; the callbacks report the resize to the
 * application. The options are read once, at the press.
 */
export function startResize(options: ResizeOptions, event: ResizeDragEvent, pointer: Point): ResizeGesture {
  const { node, bounds, keepAspectRatio, resizeAxis, shouldResize } = options;
  const direction = getControlDirection(options.position, resizeAxis);

  let prev: ResizeParams = { x: node.point().x, y: node.point().y, width: node.width(), height: node.height() };
  // A node can start outside its boundaries, e.g. an explicit size below the CSS min-size. The resize math assumes
  // an in-range start; growing from the unclamped size would subtract the gap from the pointer distance. `prev`
  // keeps the real size so the first move always writes the clamped result.
  const width = clamp(prev.width, bounds.minWidth, bounds.maxWidth);
  const height = clamp(prev.height, bounds.minHeight, bounds.maxHeight);
  const start = { ...prev, width, height, pointer, aspectRatio: width / height };

  const parent = node.parent();
  const parentExtent: CoordinateExtent | undefined =
    parent && node.extent() === 'parent'
      ? [
          [0, 0],
          [parent.width(), parent.height()],
        ]
      : undefined;
  const childExtent = getChildExtent(node);
  let children = node.children().map((child) => ({ model: child, point: { ...child.point() } }));
  let resized = false;

  node.resizing.set(true);
  options.onStart(event, { ...prev });

  return {
    move(event, pointer) {
      const next = getDimensionsAfterResize(
        start,
        direction,
        pointer,
        bounds,
        keepAspectRatio,
        parentExtent,
        childExtent,
      );

      // A restricted axis keeps its size and position, also when the aspect ratio would couple it.
      if (resizeAxis === 'vertical') Object.assign(next, { width: prev.width, x: prev.x });
      if (resizeAxis === 'horizontal') Object.assign(next, { height: prev.height, y: prev.y });

      const widthChanged = next.width !== prev.width;
      const heightChanged = next.height !== prev.height;

      if (!widthChanged && !heightChanged) {
        return;
      }

      const values: ResizeParams = {
        x: widthChanged ? next.x : prev.x,
        y: heightChanged ? next.y : prev.y,
        width: next.width,
        height: next.height,
      };
      const params: ResizeChangeParams = {
        ...values,
        direction: getResizeDirection({
          width: values.width,
          prevWidth: prev.width,
          height: values.height,
          prevHeight: prev.height,
          affectsX: direction.affectsX,
          affectsY: direction.affectsY,
        }),
      };

      if (shouldResize?.(event, params) === false) {
        return;
      }

      const dx = values.x - prev.x;
      const dy = values.y - prev.y;
      prev = values;
      resized = true;

      if (dx || dy) {
        node.setPoint({ x: values.x, y: values.y });
        // The children keep their place in the flow while the origin of the node moves.
        children = children.map(({ model, point }) => ({ model, point: { x: point.x - dx, y: point.y - dy } }));
        children.forEach(({ model, point }) => model.setPoint(point));
      }

      // An axis becomes explicit when the control drives it or the aspect ratio changed it; a side control leaves
      // the other axis following the content.
      node.setExplicitSize({
        width: direction.isHorizontal || values.width !== node.width() ? values.width : undefined,
        height: direction.isVertical || values.height !== node.height() ? values.height : undefined,
      });

      options.onResize(event, params);
    },
    end(event) {
      node.resizing.set(false);

      if (resized) {
        options.onEnd(event, { ...prev });
      }
    },
  };
}
