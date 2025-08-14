import { CurveFactoryParams, CurveLayout } from '../../interfaces/curve-factory.interface';
import { Point } from '../../interfaces/point.interface';
import { Position } from '../../types/position.type';

const handleDirections = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

export function getEdgeCenter(source: Point, target: Point): [number, number, number, number] {
  const xOffset = Math.abs(target.x - source.x) / 2;
  const centerX = target.x < source.x ? target.x + xOffset : target.x - xOffset;

  const yOffset = Math.abs(target.y - source.y) / 2;
  const centerY = target.y < source.y ? target.y + yOffset : target.y - yOffset;

  return [centerX, centerY, xOffset, yOffset];
}

const getDirection = ({
  source,
  sourcePosition = 'bottom',
  target,
}: {
  source: Point;
  sourcePosition: Position;
  target: Point;
}): Point => {
  if (sourcePosition === 'left' || sourcePosition === 'right') {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: Point, b: Point) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

// ith this function we try to mimic a orthogonal edge routing behaviour
// It's not as good as a real orthogonal edge routing but it's faster and good enough as a default for step and smooth step edges
function getPoints({
  source,
  sourcePosition = 'bottom',
  target,
  targetPosition = 'top',
  offset,
}: {
  source: Point;
  sourcePosition: Position;
  target: Point;
  targetPosition: Position;
  offset: number;
}): [Point[], number, number] {
  const sourceDir = handleDirections[sourcePosition];
  const targetDir = handleDirections[targetPosition];
  const sourceGapped: Point = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
  const targetGapped: Point = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped,
  });
  const dirAccessor = dir.x !== 0 ? 'x' : 'y';
  const currDir = dir[dirAccessor];

  let points: Point[] = [];
  let centerX, centerY;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };

  const [defaultCenterX, defaultCenterY] = getEdgeCenter(source, target);

  // opposite handle positions, default case
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    centerX = defaultCenterX;
    centerY = defaultCenterY;
    //    --->
    //    |
    // >---
    const verticalSplit: Point[] = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y },
    ];
    //    |
    //  ---
    //  |
    const horizontalSplit: Point[] = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY },
    ];

    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
    }
  } else {
    // sourceTarget means we take x from source and y from target, targetSource is the opposite
    const sourceTarget: Point[] = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource: Point[] = [{ x: targetGapped.x, y: sourceGapped.y }];
    // this handles edges with same handle positions
    if (dirAccessor === 'x') {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }

    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

      // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);
        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }

    // these are conditions for handling mixed handle positions like Right -> Bottom for example
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === 'x' ? sourceTarget : targetSource;
      }
    }

    const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
    const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
    const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
    const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));

    // we want to place the label on the longest segment of the edge
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }

  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
    target,
  ];

  return [pathPoints, centerX, centerY];
}

function getBend(a: Point, b: Point, c: Point, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

export function smoothStepPath(
  { sourcePoint, targetPoint, sourcePosition, targetPosition }: CurveFactoryParams,
  borderRadius: number = 5,
): CurveLayout {
  const [points, labelX, labelY] = getPoints({
    source: sourcePoint,
    sourcePosition,
    target: targetPoint,
    targetPosition,
    offset: 20,
  });

  const path = points.reduce<string>((res, p, i) => {
    let segment = '';

    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, '');

  // Calculate label positions along the path segments
  const segments: { start: Point; end: Point; length: number }[] = [];
  let totalLength = 0;

  // Build segments and calculate total length
  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = distance(points[i], points[i + 1]);
    segments.push({
      start: points[i],
      end: points[i + 1],
      length: segmentLength,
    });
    totalLength += segmentLength;
  }

  // Helper function to get point at a specific ratio along the entire path
  const getPointAtRatio = (ratio: number): Point => {
    const targetDistance = totalLength * ratio;
    let accumulatedDistance = 0;

    for (const segment of segments) {
      if (accumulatedDistance + segment.length >= targetDistance) {
        const segmentRatio = (targetDistance - accumulatedDistance) / segment.length;
        return {
          x: segment.start.x + (segment.end.x - segment.start.x) * segmentRatio,
          y: segment.start.y + (segment.end.y - segment.start.y) * segmentRatio,
        };
      }
      accumulatedDistance += segment.length;
    }

    // Fallback to the last point
    return points[points.length - 1];
  };

  return {
    path,
    labelPoints: {
      start: getPointAtRatio(0.15),
      center: { x: labelX, y: labelY },
      end: getPointAtRatio(0.85),
    },
  };
}
