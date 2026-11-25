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

/** Every edge joins two nodes of the graph, and a `parentId` names one; an algorithm checks neither. */
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

/** A drag of nodes in the flow, with the nodes as they are at that moment, for continuous layouts to follow. */
export interface LayoutDragEvent {
  type: 'start' | 'move' | 'end';
  nodes: LayoutNode[];
}

/** What the host offers an algorithm while it runs. */
export interface LayoutContext {
  /** The drags of nodes while the layout runs; a continuous layout pins a dragged node where the pointer puts it. */
  drags: Observable<LayoutDragEvent>;
}

/**
 * Lays out a graph: an observable whose every value is applied and whose completion ends the layout. A one-shot
 * layout emits one result (`of(result)`, or `defer` around a promise); a continuous one emits a result per step and
 * may never complete. An adapter takes its options when it is created, such as `dagreLayout({ rankdir: 'LR' })`,
 * and returns a function of this type.
 */
export type LayoutAlgorithm = (graph: LayoutGraph, context: LayoutContext) => Observable<LayoutResult>;
