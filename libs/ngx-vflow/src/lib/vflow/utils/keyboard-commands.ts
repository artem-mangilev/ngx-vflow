import { Point } from '../interfaces/point.interface';
import { KeyboardCommandName } from '../types/keyboard-shortcuts.type';

/** Where a press must come from: a focused entity wrapper, the graph container, or either of them. */
export type KeyboardCommandScope = 'entity' | 'container' | 'both';

export type ArrowDirection = 'left' | 'right' | 'up' | 'down';

/** A direction with the command that moves a node and the command that pans the view in it. */
export interface ArrowCommand {
  name: ArrowDirection;
  vector: Point;
  move: KeyboardCommandName;
  pan: KeyboardCommandName;
}

export const ARROW_COMMANDS: ArrowCommand[] = [
  { name: 'left', vector: { x: -1, y: 0 }, move: 'moveLeft', pan: 'panLeft' },
  { name: 'right', vector: { x: 1, y: 0 }, move: 'moveRight', pan: 'panRight' },
  { name: 'up', vector: { x: 0, y: -1 }, move: 'moveUp', pan: 'panUp' },
  { name: 'down', vector: { x: 0, y: 1 }, move: 'moveDown', pan: 'panDown' },
];

export const ZOOM_COMMANDS: KeyboardCommandName[] = ['zoomIn', 'zoomOut', 'fitView'];
