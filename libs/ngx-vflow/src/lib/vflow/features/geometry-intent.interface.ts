import { Signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';
import { FeatureEntry } from './feature-entry.interface';
import { VflowContext } from './vflow-context';

export type IntentKind = 'move' | 'resize';

/**
 * `start` runs once when a gesture activates, `update` once per frame, `end` once with the final geometry. A
 * one-shot session (keyboard, feature proposal) runs all three in one tick.
 */
export type IntentPhase = 'start' | 'update' | 'end';

/** Who asked for a write: `'core'` for the library's own gestures, a feature's kind for a feature. */
export type WriteOrigin = 'core' | (string & {});

export type GestureSource = 'pointer' | 'keyboard' | 'resizer' | 'plugin';

/**
 * Pixels one arrow press proposes for a keyboard session, four times as many when accelerated. A grid feature turns
 * every such step into one grid cell.
 */
export const KEYBOARD_MOVE_STEP = 5;

/** One node's proposed geometry. `point` is in the node space of its parent, like `Node.point`. */
export interface GeometryChange {
  readonly id: string;
  point?: Point;
  width?: number;
  height?: number;
  /** Id of the transform that fixed an axis; later transforms leave a claimed axis alone unless they are hard constraints. */
  claimed?: Partial<Record<'x' | 'y' | 'width' | 'height', string>>;
}

export interface GestureSession {
  readonly id: string;
  readonly source: GestureSource;
  /** Id of the node the gesture started on. */
  readonly initiator: string;
  /** Every node the gesture moves or resizes. */
  readonly nodes: readonly string[];
  /** Position (parent space) and size of each node when the gesture started. */
  readonly initial: ReadonlyMap<string, Rect>;
  /** Flow-space pointer for pointer sources, `null` for the others. */
  readonly pointer: Signal<Point | null>;
}

/** A proposed batch of node geometry changes on its way to the application's signals. */
export interface GeometryIntent {
  readonly kind: IntentKind;
  readonly phase: IntentPhase;
  readonly session: GestureSession;
  readonly origin: WriteOrigin;
  /** Mutable: a transform edits entries in place, pushes changes for other nodes or removes some. */
  readonly changes: GeometryChange[];
}

/**
 * Transforms or vetoes a geometry intent. `kinds` and `phases` restrict which intents it sees; omitted means all.
 * Returning `false` vetoes: on `start` the gesture does not activate, on `update` the frame is dropped, on `end` the
 * session's nodes return to their initial geometry.
 */
export interface GeometryTransform extends FeatureEntry {
  readonly kinds?: readonly IntentKind[];
  readonly phases?: readonly IntentPhase[];
  transform(intent: GeometryIntent, context: VflowContext): void | false;
}
