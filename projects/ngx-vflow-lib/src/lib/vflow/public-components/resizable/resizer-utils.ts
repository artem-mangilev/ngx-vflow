import { ControlPosition, CoordinateExtent, NodeOrigin } from './resizer-types';

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
 * @returns array of two numbers: `0` = no change, `1` = increase, `-1` = decrease
 */
export function getResizeDirection({
  width,
  prevWidth,
  height,
  prevHeight,
  affectsX,
  affectsY,
}: GetResizeDirectionParams) {
  const deltaWidth = width - prevWidth;
  const deltaHeight = height - prevHeight;

  const direction = [deltaWidth > 0 ? 1 : deltaWidth < 0 ? -1 : 0, deltaHeight > 0 ? 1 : deltaHeight < 0 ? -1 : 0];

  if (deltaWidth && affectsX) {
    direction[0] = direction[0] * -1;
  }

  if (deltaHeight && affectsY) {
    direction[1] = direction[1] * -1;
  }
  return direction;
}

/**
 * Parses the dragged control position into the dimensions/edges it affects.
 */
export function getControlDirection(controlPosition: ControlPosition) {
  const isHorizontal = controlPosition.includes('right') || controlPosition.includes('left');
  const isVertical = controlPosition.includes('bottom') || controlPosition.includes('top');
  const affectsX = controlPosition.includes('left');
  const affectsY = controlPosition.includes('top');

  return {
    isHorizontal,
    isVertical,
    affectsX,
    affectsY,
  };
}

interface PrevValues {
  width: number;
  height: number;
  x: number;
  y: number;
}

type StartValues = PrevValues & {
  pointerX: number;
  pointerY: number;
  aspectRatio: number;
};

interface PointerPosition {
  xSnapped: number;
  ySnapped: number;
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
 * Calculates the new width/height and x/y of a node after a resize, applying every
 * restriction (min/max size, parent extent, child extent, aspect ratio and node origin)
 * by computing the strongest "clamp" and applying it to the pointer-movement distance.
 */
export function getDimensionsAfterResize(
  startValues: StartValues,
  controlDirection: ReturnType<typeof getControlDirection>,
  pointerPosition: PointerPosition,
  boundaries: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number },
  keepAspectRatio: boolean,
  nodeOrigin: NodeOrigin,
  extent?: CoordinateExtent,
  childExtent?: CoordinateExtent,
) {
  let { affectsX, affectsY } = controlDirection;
  const { isHorizontal, isVertical } = controlDirection;
  const isDiagonal = isHorizontal && isVertical;

  const { xSnapped, ySnapped } = pointerPosition;
  const { minWidth, maxWidth, minHeight, maxHeight } = boundaries;

  const { x: startX, y: startY, width: startWidth, height: startHeight, aspectRatio } = startValues;
  let distX = Math.floor(isHorizontal ? xSnapped - startValues.pointerX : 0);
  let distY = Math.floor(isVertical ? ySnapped - startValues.pointerY : 0);

  const newWidth = startWidth + (affectsX ? -distX : distX);
  const newHeight = startHeight + (affectsY ? -distY : distY);

  const originOffsetX = -nodeOrigin[0] * startWidth;
  const originOffsetY = -nodeOrigin[1] * startHeight;

  // Check if min/max width/height are restricting the resize
  let clampX = getSizeClamp(newWidth, minWidth, maxWidth);
  let clampY = getSizeClamp(newHeight, minHeight, maxHeight);

  // Check if extent (parent) is restricting the resize
  if (extent) {
    let xExtentClamp = 0;
    let yExtentClamp = 0;
    if (affectsX && distX < 0) {
      xExtentClamp = getLowerExtentClamp(startX + distX + originOffsetX, extent[0][0]);
    } else if (!affectsX && distX > 0) {
      xExtentClamp = getUpperExtentClamp(startX + newWidth + originOffsetX, extent[1][0]);
    }

    if (affectsY && distY < 0) {
      yExtentClamp = getLowerExtentClamp(startY + distY + originOffsetY, extent[0][1]);
    } else if (!affectsY && distY > 0) {
      yExtentClamp = getUpperExtentClamp(startY + newHeight + originOffsetY, extent[1][1]);
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
          aspectExtentClamp =
            getUpperExtentClamp(startY + originOffsetY + newWidth / aspectRatio, extent[1][1]) * aspectRatio;
        } else {
          aspectExtentClamp =
            getLowerExtentClamp(startY + originOffsetY + (affectsX ? distX : -distX) / aspectRatio, extent[0][1]) *
            aspectRatio;
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
          aspectExtentClamp =
            getUpperExtentClamp(startX + newHeight * aspectRatio + originOffsetX, extent[1][0]) / aspectRatio;
        } else {
          aspectExtentClamp =
            getLowerExtentClamp(startX + (affectsY ? distY : -distY) * aspectRatio + originOffsetX, extent[0][0]) /
            aspectRatio;
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

  const x = affectsX ? startX + distX : startX;
  const y = affectsY ? startY + distY : startY;

  return {
    width: startWidth + (affectsX ? -distX : distX),
    height: startHeight + (affectsY ? -distY : distY),
    x: nodeOrigin[0] * distX * (!affectsX ? 1 : -1) + x,
    y: nodeOrigin[1] * distY * (!affectsY ? 1 : -1) + y,
  };
}
