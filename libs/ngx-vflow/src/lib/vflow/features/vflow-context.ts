import { Signal } from '@angular/core';
import { NodeGeometry } from '../interfaces/curve-factory.interface';
import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { GeometryChange, GestureSession, IntentKind, WriteOrigin } from './geometry-intent.interface';

/**
 * A rendered node's box: `x`/`y` are its flow-space position, `point` the position in its parent's space, as the
 * application stores it. `measured` is false while an `auto` node still shows the default size.
 */
export interface RenderedNodeGeometry extends NodeGeometry {
  readonly point: Point;
  readonly parentId: string | null;
  readonly measured: boolean;
}

/** A library gesture in progress. */
export type FlowInteraction = 'node-drag' | 'connection' | 'reconnection';

export interface ProposeOptions {
  /** Who asks for the write; a feature passes its kind. Defaults to `'application'`. */
  readonly origin?: WriteOrigin;
}

/**
 * What a feature receives from the flow it runs in: live geometry, the active gesture, the viewport, and the one
 * sanctioned way to write geometry, {@link propose}. Provided by `<vflow>` and injectable by features and by any
 * descendant of the flow, such as a node presentation.
 */
export abstract class VflowContext {
  /** The gesture session in progress, or `null`. */
  public abstract readonly gesture: Signal<GestureSession | null>;
  /** Increments after every applied batch, so an asynchronous producer can tell a stale result from a fresh one. */
  public abstract readonly revision: Signal<number>;
  /** The library gesture in progress, or `null`. */
  public abstract readonly interaction: Signal<FlowInteraction | null>;
  /** Pointer position in viewport pixels while a library gesture is active, `null` otherwise or before the first move. */
  public abstract readonly pointer: Signal<Point | null>;
  public abstract readonly viewport: Signal<ViewportState>;
  /** Rendered size of the flow in pixels. */
  public abstract readonly size: Signal<{ width: number; height: number }>;

  /** Live geometry of a rendered node, or `null` when no node has this id. */
  public abstract getNodeGeometry(id: string): RenderedNodeGeometry | null;

  /**
   * Proposes a batch of geometry changes as a one-shot session and applies what survives. Returns whether anything
   * was applied.
   */
  public abstract propose(kind: IntentKind, changes: GeometryChange[], options?: ProposeOptions): boolean;

  /** Moves the viewport by a delta in viewport pixels, keeping the zoom. */
  public abstract panBy(delta: Point): void;

  public abstract clientToFlowPosition(point: Point): Point;
  public abstract flowToClientPosition(point: Point): Point;
  /** Converts a position relative to a node into flow space; `undefined` when the node does not exist. */
  public abstract nodeSpaceToFlowPosition(point: Point, spaceNodeId: string): Point | undefined;
  /** Converts a flow-space position into coordinates relative to a node; `undefined` when the node does not exist. */
  public abstract flowToNodeSpacePosition(point: Point, spaceNodeId: string): Point | undefined;
}
