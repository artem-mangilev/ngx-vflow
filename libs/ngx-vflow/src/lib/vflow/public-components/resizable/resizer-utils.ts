import { Point } from '../../interfaces/point.interface';
import { ControlPosition, CoordinateExtent, ResizeAxis, ResizeEvent } from './resizer-types';

type ResizeDirection = ResizeEvent['direction'];
type ResizeSign = ResizeDirection['x'];

/** The axes a control drags and the sides it moves. */
export interface ControlDirection {
  isHorizontal: boolean;
  isVertical: boolean;
  /** The control is on the left side: growing moves the node origin. */
  affectsX: boolean;
  /** The control is on the top side. */
  affectsY: boolean;
}

/** Parses the dragged control position into the dimensions it drives; a restricted axis does not exist to it. */
export function getControlDirection(position: ControlPosition, axis?: ResizeAxis): ControlDirection {
  const horizontal = axis !== 'vertical';
  const vertical = axis !== 'horizontal';

  return {
    isHorizontal: horizontal && (position.includes('right') || position.includes('left')),
    isVertical: vertical && (position.includes('bottom') || position.includes('top')),
    affectsX: horizontal && position.includes('left'),
    affectsY: vertical && position.includes('top'),
  };
}

interface GetResizeDirectionParams {
  width: number;
  prevWidth: number;
  height: number;
  prevHeight: number;
  affectsX: boolean;
  affectsY: boolean;
}

/**
 * Computes the resize direction for each axis based on size delta.
 *
 * @returns sign per axis: `0` = no change, `1` = increase, `-1` = decrease
 */
export function getResizeDirection({
  width,
  prevWidth,
  height,
  prevHeight,
  affectsX,
  affectsY,
}: GetResizeDirectionParams): ResizeDirection {
  const x = Math.sign(width - prevWidth) as ResizeSign;
  const y = Math.sign(height - prevHeight) as ResizeSign;

  // A control on the left or top edge moves the origin: growing the size moves that edge in the negative direction.
  return { x: affectsX ? ((-x || 0) as ResizeSign) : x, y: affectsY ? ((-y || 0) as ResizeSign) : y };
}

export interface ResizeBounds {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

/** The node and the pointer at the press, in flow units. */
export interface ResizeStart {
  x: number;
  y: number;
  width: number;
  height: number;
  pointer: Point;
  aspectRatio: number;
}

function getLowerExtentClamp(lowerExtent: number, lowerBound: number) {
  return Math.max(0, lowerBound - lowerExtent);
}

function getUpperExtentClamp(upperExtent: number, upperBound: number) {
  return Math.max(0, upperExtent - upperBound);
}

function getSizeClamp(size: number, minSize: number, maxSize: number) {
  return Math.max(0, minSize - size, size - maxSize);
}

function xor(a: boolean, b: boolean) {
  return a ? !b : b;
}

/**
 * Calculates the new width/height and x/y of a node after a resize, applying every restriction (min/max size, parent
 * extent, child extent and aspect ratio) by computing the strongest "clamp" and applying it to the pointer-movement
 * distance.
 */
export function getDimensionsAfterResize(
  start: ResizeStart,
  direction: ControlDirection,
  pointer: Point,
  bounds: ResizeBounds,
  keepAspectRatio: boolean,
  extent?: CoordinateExtent,
  childExtent?: CoordinateExtent,
) {
  let { affectsX, affectsY } = direction;
  const { isHorizontal, isVertical } = direction;
  const isDiagonal = isHorizontal && isVertical;

  const { minWidth, maxWidth, minHeight, maxHeight } = bounds;

  const { x: startX, y: startY, width: startWidth, height: startHeight, aspectRatio } = start;
  let distX = Math.floor(isHorizontal ? pointer.x - start.pointer.x : 0);
  let distY = Math.floor(isVertical ? pointer.y - start.pointer.y : 0);

  const newWidth = startWidth + (affectsX ? -distX : distX);
  const newHeight = startHeight + (affectsY ? -distY : distY);

  // Check if min/max width/height are restricting the resize
  let clampX = getSizeClamp(newWidth, minWidth, maxWidth);
  let clampY = getSizeClamp(newHeight, minHeight, maxHeight);

  // Check if extent (parent) is restricting the resize
  if (extent) {
    let xExtentClamp = 0;
    let yExtentClamp = 0;
    if (affectsX && distX < 0) {
      xExtentClamp = getLowerExtentClamp(startX + distX, extent[0][0]);
    } else if (!affectsX && distX > 0) {
      xExtentClamp = getUpperExtentClamp(startX + newWidth, extent[1][0]);
    }

    if (affectsY && distY < 0) {
      yExtentClamp = getLowerExtentClamp(startY + distY, extent[0][1]);
    } else if (!affectsY && distY > 0) {
      yExtentClamp = getUpperExtentClamp(startY + newHeight, extent[1][1]);
    }

    clampX = Math.max(clampX, xExtentClamp);
    clampY = Math.max(clampY, yExtentClamp);
  }

  // Check if the child extent is restricting the resize
  if (childExtent) {
    let xExtentClamp = 0;
    let yExtentClamp = 0;
    if (affectsX && distX > 0) {
      xExtentClamp = getUpperExtentClamp(startX + distX, childExtent[0][0]);
    } else if (!affectsX && distX < 0) {
      xExtentClamp = getLowerExtentClamp(startX + newWidth, childExtent[1][0]);
    }

    if (affectsY && distY > 0) {
      yExtentClamp = getUpperExtentClamp(startY + distY, childExtent[0][1]);
    } else if (!affectsY && distY < 0) {
      yExtentClamp = getLowerExtentClamp(startY + newHeight, childExtent[1][1]);
    }

    clampX = Math.max(clampX, xExtentClamp);
    clampY = Math.max(clampY, yExtentClamp);
  }

  // Check if the aspect ratio resizing of the other side is restricting the resize
  if (keepAspectRatio) {
    if (isHorizontal) {
      const aspectHeightClamp = getSizeClamp(newWidth / aspectRatio, minHeight, maxHeight) * aspectRatio;
      clampX = Math.max(clampX, aspectHeightClamp);

      if (extent) {
        let aspectExtentClamp = 0;
        if ((!affectsX && !affectsY) || (affectsX && !affectsY && isDiagonal)) {
          aspectExtentClamp = getUpperExtentClamp(startY + newWidth / aspectRatio, extent[1][1]) * aspectRatio;
        } else {
          aspectExtentClamp =
            getLowerExtentClamp(startY + (affectsX ? distX : -distX) / aspectRatio, extent[0][1]) * aspectRatio;
        }
        clampX = Math.max(clampX, aspectExtentClamp);
      }

      if (childExtent) {
        let aspectExtentClamp = 0;
        if ((!affectsX && !affectsY) || (affectsX && !affectsY && isDiagonal)) {
          aspectExtentClamp = getLowerExtentClamp(startY + newWidth / aspectRatio, childExtent[1][1]) * aspectRatio;
        } else {
          aspectExtentClamp =
            getUpperExtentClamp(startY + (affectsX ? distX : -distX) / aspectRatio, childExtent[0][1]) * aspectRatio;
        }
        clampX = Math.max(clampX, aspectExtentClamp);
      }
    }

    if (isVertical) {
      const aspectWidthClamp = getSizeClamp(newHeight * aspectRatio, minWidth, maxWidth) / aspectRatio;
      clampY = Math.max(clampY, aspectWidthClamp);

      if (extent) {
        let aspectExtentClamp = 0;
        if ((!affectsX && !affectsY) || (affectsY && !affectsX && isDiagonal)) {
          aspectExtentClamp = getUpperExtentClamp(startX + newHeight * aspectRatio, extent[1][0]) / aspectRatio;
        } else {
          aspectExtentClamp =
            getLowerExtentClamp(startX + (affectsY ? distY : -distY) * aspectRatio, extent[0][0]) / aspectRatio;
        }
        clampY = Math.max(clampY, aspectExtentClamp);
      }

      if (childExtent) {
        let aspectExtentClamp = 0;
        if ((!affectsX && !affectsY) || (affectsY && !affectsX && isDiagonal)) {
          aspectExtentClamp = getLowerExtentClamp(startX + newHeight * aspectRatio, childExtent[1][0]) / aspectRatio;
        } else {
          aspectExtentClamp =
            getUpperExtentClamp(startX + (affectsY ? distY : -distY) * aspectRatio, childExtent[0][0]) / aspectRatio;
        }
        clampY = Math.max(clampY, aspectExtentClamp);
      }
    }
  }

  distY = distY + (distY < 0 ? clampY : -clampY);
  distX = distX + (distX < 0 ? clampX : -clampX);

  if (keepAspectRatio) {
    if (isDiagonal) {
      if (newWidth > newHeight * aspectRatio) {
        distY = (xor(affectsX, affectsY) ? -distX : distX) / aspectRatio;
      } else {
        distX = (xor(affectsX, affectsY) ? -distY : distY) * aspectRatio;
      }
    } else {
      if (isHorizontal) {
        distY = distX / aspectRatio;
        affectsY = affectsX;
      } else {
        distX = distY * aspectRatio;
        affectsX = affectsY;
      }
    }
  }

  return {
    width: startWidth + (affectsX ? -distX : distX),
    height: startHeight + (affectsY ? -distY : distY),
    x: affectsX ? startX + distX : startX,
    y: affectsY ? startY + distY : startY,
  };
}
