import { Subject, lastValueFrom } from 'rxjs';
import { LayoutAlgorithm, LayoutDragEvent, LayoutGraph, LayoutNode, LayoutResult } from './layout.types';

/** A node of a layout graph at the origin; 100×50 unless told otherwise. */
export function layoutNode(id: string, parentId: string | null = null, width = 100, height = 50): LayoutNode {
  return { id, parentId, width, height, x: 0, y: 0 };
}

/**
 * A graph with a chain, a branch, a self-loop and a group of two nodes:
 * `a → b → d → e`, `a → c`, `c → c`, where `d` and `e` are in `group`.
 */
export function sampleGraph(): LayoutGraph {
  return {
    nodes: [
      layoutNode('a'),
      layoutNode('b'),
      layoutNode('c'),
      layoutNode('group', null, 300, 200),
      layoutNode('d', 'group'),
      layoutNode('e', 'group'),
    ],
    edges: [
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'a-c', source: 'a', target: 'c' },
      { id: 'b-d', source: 'b', target: 'd' },
      { id: 'd-e', source: 'd', target: 'e' },
      { id: 'loop', source: 'c', target: 'c' },
    ],
  };
}

/** The result of a one-shot algorithm. */
export function once(algorithm: LayoutAlgorithm, graph: LayoutGraph): Promise<LayoutResult> {
  return lastValueFrom(algorithm(graph, { drags: new Subject<LayoutDragEvent>() }));
}

/** Whether a child, 100×50 unless told otherwise, lies within its parent in a layout result. */
export function isInside(result: LayoutResult, childId: string, parentId: string, width = 100, height = 50): boolean {
  const child = result.positions.get(childId)!;
  const parent = result.positions.get(parentId)!;
  const size = result.sizes!.get(parentId)!;
  return (
    child.x >= parent.x &&
    child.y >= parent.y &&
    child.x + width <= parent.x + size.width &&
    child.y + height <= parent.y + size.height
  );
}
