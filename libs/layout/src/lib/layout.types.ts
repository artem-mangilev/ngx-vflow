import { Point } from 'ngx-vflow';
import { Observable } from 'rxjs';

/** A node as a layout algorithm sees it: its rendered size and its current position, in flow space. */
export interface LayoutNode {
  id: string;
  /** Rendered width, measured for a content-sized node. */
  width: number;
  /** Rendered height, measured for a content-sized node. */
  height: number;
  /** The parent node for nested layouts, or `null`. */
  parentId: string | null;
  /** Current position in flow space, for algorithms that start from the positions they have. */
  x: number;
  y: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}

export interface LayoutGraph {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}

/** Positions of the nodes in flow space, by node id. A node the result leaves out stays where it is. */
export interface LayoutResult {
  positions: ReadonlyMap<string, Point>;
  /** Sizes an algorithm gives to parents it lays out around their children; applied to nodes with explicit sizes. */
  sizes?: ReadonlyMap<string, { width: number; height: number }>;
}

/**
 * Lays out a graph: at once, after a promise, or continuously through an observable whose every value is applied
 * and whose completion ends the layout. An adapter takes its options when it is created, such as
 * `dagreLayout({ rankdir: 'LR' })`, and returns a function of this type.
 */
export type LayoutAlgorithm = (graph: LayoutGraph) => LayoutResult | Promise<LayoutResult> | Observable<LayoutResult>;
