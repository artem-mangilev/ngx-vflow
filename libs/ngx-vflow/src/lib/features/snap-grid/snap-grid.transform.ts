import { inject } from '@angular/core';
import {
  GeometryChange,
  GeometryIntent,
  GeometryTransform,
  KEYBOARD_MOVE_STEP,
} from '../../vflow/features/geometry-intent.interface';
import { Rect } from '../../vflow/interfaces/rect';
import { SnapGridSettings } from './snap-grid-settings';

type Axis = 'x' | 'y';
const SIZE_OF: Record<Axis, 'width' | 'height'> = { x: 'width', y: 'height' };

/**
 * Aligns proposed geometry to the grid. A move snaps the position: a pointer to the nearest line, a keyboard press
 * to the next line in its direction, one line per {@link KEYBOARD_MOVE_STEP}. A resize snaps the edge that moves
 * and keeps the anchored edge where it is, shifting the children back by whatever the snap added to the origin.
 * An axis another transform claimed is left alone; the axes it snaps are claimed.
 */
export class SnapGridTransform implements GeometryTransform {
  public readonly id = 'snap-grid';
  public readonly precedence = 'default';
  public readonly kinds = ['move', 'resize'] as const;
  public readonly phases = ['update', 'end'] as const;

  private readonly settings = inject(SnapGridSettings);

  public transform(intent: GeometryIntent): void {
    const grid = this.settings.grid();
    if (grid[0] <= 1 && grid[1] <= 1) return;
    if (intent.kind === 'move') this.snapMove(intent, grid);
    else this.snapResize(intent, grid);
  }

  private snapMove(intent: GeometryIntent, grid: [number, number]): void {
    const keyboard = intent.session.source === 'keyboard';
    for (const change of intent.changes) {
      if (!change.point) continue;
      const claimed = (change.claimed ??= {});
      const from = keyboard ? intent.session.initial.get(change.id) : undefined;
      for (const axis of ['x', 'y'] as const) {
        const step = axis === 'x' ? grid[0] : grid[1];
        if (step <= 1 || claimed[axis]) continue;
        change.point[axis] = from ? snapSteps(change.point[axis], step, from[axis]) : nearest(change.point[axis], step);
        claimed[axis] = this.id;
      }
    }
  }

  private snapResize(intent: GeometryIntent, grid: [number, number]): void {
    const target = intent.changes.find((change) => change.id === intent.session.initiator);
    const initial = intent.session.initial.get(intent.session.initiator);
    if (!target || !initial) return;

    const shift = { x: 0, y: 0 };
    for (const axis of ['x', 'y'] as const) {
      const step = axis === 'x' ? grid[0] : grid[1];
      if (step > 1) shift[axis] = this.snapEdge(target, initial, axis, step);
    }
    if (!shift.x && !shift.y) return;
    // The children are positioned in the resized node's space: an origin the snap moved must not move them.
    for (const change of intent.changes) {
      if (change !== target && change.point) {
        change.point.x -= shift.x;
        change.point.y -= shift.y;
      }
    }
  }

  /** Snaps the moving edge on one axis and returns how far the snap moved the origin. */
  private snapEdge(target: GeometryChange, initial: Rect, axis: Axis, step: number): number {
    const size = SIZE_OF[axis];
    const length = target[size];
    const claimed = (target.claimed ??= {});
    if (length === undefined || claimed[axis] || claimed[size]) return 0;

    const start = target.point?.[axis] ?? initial[axis];
    if (target.point && start !== initial[axis]) {
      // The start edge moved: snap it and keep the far edge where the gesture put it.
      const snapped = nearest(start, step);
      if (length + (start - snapped) <= 0) return 0;
      target.point[axis] = snapped;
      target[size] = length + (start - snapped);
      claimed[axis] = claimed[size] = this.id;
      return snapped - start;
    }
    const snapped = nearest(start + length, step) - start;
    if (snapped <= 0) return 0;
    target[size] = snapped;
    claimed[size] = this.id;
    return 0;
  }
}

function nearest(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

/** The grid line `steps` presses away from `from` in the direction of `value`, where a press is one line. */
function snapSteps(value: number, grid: number, from: number): number {
  const delta = value - from;
  if (delta === 0) return nearest(value, grid);
  const lines = Math.max(1, Math.round(Math.abs(delta) / KEYBOARD_MOVE_STEP));
  const first = delta > 0 ? Math.floor(from / grid + 1) * grid : Math.ceil(from / grid - 1) * grid;
  return first + Math.sign(delta) * (lines - 1) * grid;
}
