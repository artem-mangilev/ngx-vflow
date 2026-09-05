import { signal } from '@angular/core';
import {
  Edge,
  Node,
  addEdges,
  addNodes,
  reconnectEdges,
  removeEdges,
  removeNodes,
  reparentNodes,
} from '../../../public-api';

function node(id: string, x = 0, y = 0, parentId?: string | null): Node {
  return {
    id,
    type: 'default',
    point: signal({ x, y }),
    parentId: signal(parentId ?? null),
  };
}

describe('graph operations', () => {
  it('adds nodes left-to-right without forward references or duplicate ids', () => {
    const parent = node('parent');
    const child = node('child', 0, 0, 'parent');
    const warn = spyOn(console, 'warn');

    const forwardReference = addNodes([child, parent], []);
    expect(forwardReference).toEqual([parent]);
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Cannot find parent node "parent".');

    const added = addNodes([child], forwardReference);
    expect(added).toEqual([parent, child]);
    expect(addNodes([node('parent')], added)).toBe(added);
  });

  it('adds valid self-connections and ignores duplicate connection tuples', () => {
    const nodes = [node('a'), node('b')];
    const selected = signal(true);
    const first: Edge = {
      id: 'first',
      source: 'a',
      target: 'a',
      sourceHandle: '',
      selected,
    };
    const duplicate: Edge = { id: 'duplicate', source: 'a', target: 'a' };
    const customHandles: Edge = {
      id: 'handles',
      source: 'a',
      target: 'b',
      sourceHandle: 'out',
      targetHandle: 'in',
    };

    const added = addEdges([first, duplicate, customHandles], { nodes, edges: [] });
    expect(added).toEqual([first, customHandles]);
    expect(added[0].selected).toBe(selected);
    expect(addEdges([duplicate], { nodes, edges: added })).toBe(added);
  });

  it('rejects missing and ambiguous edge endpoints without throwing', () => {
    const nodes = [node('a'), node('a')];
    const edges: Edge[] = [];
    const warn = spyOn(console, 'warn');

    expect(addEdges([{ id: 'edge', source: 'a', target: 'missing' }], { nodes, edges })).toBe(edges);
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Cannot target endpoint node "a" because its id is ambiguous.');
  });

  it('removes descendants and incident edges in original collection order', () => {
    const child = node('child', 10, 10, 'parent');
    const unrelated = node('unrelated');
    const parent = node('parent');
    const descendant = node('descendant', 5, 5, 'child');
    const nodes = [child, unrelated, parent, descendant];
    const keep: Edge = { id: 'keep', source: 'unrelated', target: 'missing' };
    const childEdge: Edge = { id: 'child-edge', source: 'child', target: 'unrelated' };
    const parentEdge: Edge = { id: 'parent-edge', source: 'unrelated', target: 'parent' };
    const edges = [keep, childEdge, parentEdge];

    const result = removeNodes(['parent'], { nodes, edges });

    expect(result.nodes).toEqual([unrelated]);
    expect(result.edges).toEqual([keep]);
    expect(result.removedNodes).toEqual([child, parent, descendant]);
    expect(result.removedEdges).toEqual([childEdge, parentEdge]);
    expect(result.nodes[0]).toBe(unrelated);
    expect(removeNodes(['missing'], { nodes, edges })).toEqual({
      nodes,
      edges,
      removedNodes: [],
      removedEdges: [],
    });
  });

  it('safely removes a reachable parent cycle', () => {
    const a = node('a', 0, 0, 'b');
    const b = node('b', 0, 0, 'a');
    const edge: Edge = { id: 'edge', source: 'a', target: 'b' };
    const warn = spyOn(console, 'warn');

    const result = removeNodes(['a'], { nodes: [a, b], edges: [edge] });
    expect(result.removedNodes).toEqual([a, b]);
    expect(result.removedEdges).toEqual([edge]);
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Removing node "a" and its cyclic descendant closure.');
  });

  it('reparents any node type while preserving flow position and unrelated signals', () => {
    const oldParent = node('old-parent', 100, 100);
    const newParent = node('new-parent', 300, 50);
    const selected = signal(true);
    const child = { ...node('child', 10, 20, 'old-parent'), selected };
    const point = child.point;
    const parentId = child.parentId;
    const descendant = node('descendant', 5, 5, 'child');
    const nodes = [oldParent, child, descendant, newParent];

    const result = reparentNodes([{ id: 'child', parentId: 'new-parent' }], nodes);
    const moved = result[1];

    expect(result[0]).toBe(oldParent);
    expect(result[2]).toBe(descendant);
    expect(result).not.toBe(nodes);
    expect(moved).toBe(child);
    expect(moved.point).toBe(point);
    expect(moved.parentId).toBe(parentId);
    expect(moved.selected).toBe(selected);
    expect(moved.point()).toEqual({ x: -190, y: 70 });
    expect(moved.parentId?.()).toBe('new-parent');
    expect(reparentNodes([{ id: 'child', parentId: 'new-parent' }], result)).toBe(result);
  });

  it('rejects descendant reparenting and cyclic ancestry', () => {
    const parent = node('parent');
    const child = node('child', 0, 0, 'parent');
    const cycleA = node('cycle-a', 0, 0, 'cycle-b');
    const cycleB = node('cycle-b', 0, 0, 'cycle-a');
    const nodes = [parent, child, cycleA, cycleB];
    const warn = spyOn(console, 'warn');

    expect(reparentNodes([{ id: 'parent', parentId: 'child' }], nodes)).toBe(nodes);
    expect(reparentNodes([{ id: 'cycle-a', parentId: null }], nodes)).toBe(nodes);
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Cannot update node "parent" because of descendant parent.');
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Cannot update node "cycle-a" because of cyclic ancestry.');
  });

  it('adds a parent signal without replacing a node that did not have one', () => {
    const child: Node = { id: 'child', type: 'default', point: signal({ x: 10, y: 20 }) };
    const parent = node('parent', 100, 50);

    const result = reparentNodes([{ id: 'child', parentId: 'parent' }], [child, parent]);

    expect(result[0]).toBe(child);
    expect(child.parentId?.()).toBe('parent');
    expect(child.point()).toEqual({ x: -90, y: -30 });
  });

  it('removes only uniquely addressed edges and preserves a full no-op reference', () => {
    const duplicateA: Edge = { id: 'duplicate', source: 'a', target: 'b' };
    const duplicateB: Edge = { id: 'duplicate', source: 'b', target: 'a' };
    const keep: Edge = { id: 'keep', source: 'a', target: 'a' };
    const edges = [duplicateA, keep, duplicateB];
    const warn = spyOn(console, 'warn');

    expect(removeEdges(['duplicate'], edges)).toBe(edges);
    expect(warn).toHaveBeenCalledWith('[ngx-vflow] Cannot target edge "duplicate" because its id is ambiguous.');
    expect(removeEdges(['keep'], edges)).toEqual([duplicateA, duplicateB]);
  });

  it('reconnects edges in place while preserving id, metadata, and signals', () => {
    const selected = signal(true);
    const before: Edge = { id: 'before', source: 'a', target: 'b' };
    const edge: Edge = { id: 'edge', source: 'a', target: 'b', selected, sourceHandle: 'old' };
    const after: Edge = { id: 'after', source: 'b', target: 'a' };
    const edges = [before, edge, after];
    const nodes = [node('a'), node('b')];

    const result = reconnectEdges(
      [{ id: 'edge', connection: { source: 'b', target: 'a', sourceHandle: 'out', targetHandle: 'in' } }],
      { nodes, edges },
    );

    expect(result[0]).toBe(before);
    expect(result[2]).toBe(after);
    expect(result[1]).toEqual({
      ...edge,
      source: 'b',
      target: 'a',
      sourceHandle: 'out',
      targetHandle: 'in',
    });
    expect(result[1].id).toBe('edge');
    expect(result[1].selected).toBe(selected);
    expect(reconnectEdges([{ id: 'edge', connection: edge }], { nodes, edges })).toBe(edges);
  });
});
