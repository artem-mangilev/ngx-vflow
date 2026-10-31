import { signal } from '@angular/core';
import {
  Edge,
  Node,
  ReconnectEvent,
  addEdges,
  addNodes,
  reconnectEdges,
  removeEdges,
  removeElements,
  reparentNodes,
} from '../../../public-api';

function node(id: string, x = 0, y = 0, parentId?: string | null): Node {
  return {
    id,
    point: signal({ x, y }),
    parentId: signal(parentId ?? null),
  };
}

describe('graph operations', () => {
  it('adds nodes left-to-right without forward references or duplicate ids', () => {
    const parent = node('parent');
    const child = node('child', 0, 0, 'parent');

    const forwardReference = addNodes([child, parent], []);
    expect(forwardReference).toEqual([parent]);

    const added = addNodes([child], forwardReference);
    expect(added).toEqual([parent, child]);
    expect(addNodes([node('parent')], added)).toBe(added);
  });

  it('appends edges in input order and keeps their objects', () => {
    const nodes = [node('a'), node('b')];
    const selected = signal(true);
    const first: Edge = { id: 'first', source: 'a', target: 'b', selected };
    const customHandles: Edge = {
      id: 'handles',
      source: 'a',
      target: 'b',
      sourceHandle: 'out',
      targetHandle: 'in',
    };

    const added = addEdges([first, customHandles], { nodes, edges: [] });
    expect(added).toEqual([first, customHandles]);
    expect(added[0]).toBe(first);
    expect(added[0].selected).toBe(selected);
  });

  it('rejects missing and ambiguous edge endpoints without throwing', () => {
    const nodes = [node('a'), node('a')];
    const edges: Edge[] = [];

    expect(addEdges([{ id: 'edge', source: 'a', target: 'missing' }], { nodes, edges })).toBe(edges);
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

    const result = removeElements({ nodeIds: ['parent'] }, { nodes, edges });

    expect(result.nodes).toEqual([unrelated]);
    expect(result.edges).toEqual([keep]);
    expect(result.removedNodes).toEqual([child, parent, descendant]);
    expect(result.removedEdges).toEqual([childEdge, parentEdge]);
    expect(result.nodes[0]).toBe(unrelated);
    expect(removeElements({ nodeIds: ['missing'] }, { nodes, edges })).toEqual({
      nodes,
      edges,
      removedNodes: [],
      removedEdges: [],
    });
  });

  it('removes the requested edges together with the edges of the removed nodes, each once', () => {
    const a = node('a');
    const b = node('b');
    const c = node('c');
    const ab: Edge = { id: 'a-b', source: 'a', target: 'b' };
    const bc: Edge = { id: 'b-c', source: 'b', target: 'c' };
    const ca: Edge = { id: 'c-a', source: 'c', target: 'a' };
    const nodes = [a, b, c];
    const edges = [ab, bc, ca];

    const result = removeElements({ nodeIds: ['a'], edgeIds: ['b-c', 'a-b'] }, { nodes, edges });

    expect(result.nodes).toEqual([b, c]);
    expect(result.edges).toEqual([]);
    expect(result.removedNodes).toEqual([a]);
    expect(result.removedEdges).toEqual([ab, bc, ca]);

    const edgesOnly = removeElements({ edgeIds: ['b-c'] }, { nodes, edges });
    expect(edgesOnly.nodes).toBe(nodes);
    expect(edgesOnly.edges).toEqual([ab, ca]);
    expect(edgesOnly.removedEdges).toEqual([bc]);
  });

  it('safely removes a reachable parent cycle', () => {
    const a = node('a', 0, 0, 'b');
    const b = node('b', 0, 0, 'a');
    const edge: Edge = { id: 'edge', source: 'a', target: 'b' };

    const result = removeElements({ nodeIds: ['a'] }, { nodes: [a, b], edges: [edge] });
    expect(result.removedNodes).toEqual([a, b]);
    expect(result.removedEdges).toEqual([edge]);
  });

  it('resolves duplicate ids against the survivors of earlier removals in the same batch', () => {
    const parent = node('parent');
    const child = node('duplicate', 0, 0, 'parent');
    const other = node('duplicate');
    const nodes = [parent, child, other];
    const result = removeElements({ nodeIds: ['duplicate', 'parent', 'duplicate'] }, { nodes, edges: [] });
    expect(result.nodes).toEqual([]);
    expect(result.removedNodes).toEqual(nodes);
    const unchanged = removeElements({ nodeIds: ['missing'] }, { nodes, edges: [] });
    expect(unchanged.nodes).toBe(nodes);
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

    expect(reparentNodes([{ id: 'parent', parentId: 'child' }], nodes)).toBe(nodes);
    expect(reparentNodes([{ id: 'cycle-a', parentId: null }], nodes)).toBe(nodes);
  });

  it('adds a parent signal without replacing a node that did not have one', () => {
    const child: Node = { id: 'child', point: signal({ x: 10, y: 20 }) };
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

    expect(removeEdges(['duplicate'], edges)).toBe(edges);
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
      [{ edge: { id: 'edge' }, connection: { source: 'b', target: 'a', sourceHandle: 'out', targetHandle: 'in' } }],
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
    expect(reconnectEdges([{ edge: { id: 'edge' }, connection: edge }], { nodes, edges })).toBe(edges);
  });

  it('rejects an edge whose id already exists and keeps the collection reference', () => {
    const nodes = [node('a'), node('b')];
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'b' }];

    expect(addEdges([{ id: 'edge', source: 'b', target: 'a' }], { nodes, edges })).toBe(edges);
  });

  it('adds duplicate connections and self-connections, which only the gesture rejects', () => {
    const nodes = [node('a'), node('b')];
    const edges: Edge[] = [{ id: 'first', source: 'a', target: 'b' }];

    const result = addEdges(
      [
        { id: 'second', source: 'a', target: 'b' },
        { id: 'loop', source: 'a', target: 'a' },
      ],
      { nodes, edges },
    );

    expect(result.map(({ id }) => id)).toEqual(['first', 'second', 'loop']);
  });

  it('applies a reconnect event as an operation', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const edge: Edge = { id: 'edge', source: 'a', target: 'b' };
    const event: ReconnectEvent = { edge, connection: { source: 'a', target: 'c' } };

    const [reconnected] = reconnectEdges([event], { nodes, edges: [edge] });

    expect(reconnected).toEqual({ ...edge, target: 'c' });
  });

  it('reconnects nothing for an unknown edge or endpoint and keeps the collection reference', () => {
    const nodes = [node('a'), node('b')];
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'b' }];

    expect(
      reconnectEdges([{ edge: { id: 'missing' }, connection: { source: 'b', target: 'a' } }], { nodes, edges }),
    ).toBe(edges);
    expect(
      reconnectEdges([{ edge: { id: 'edge' }, connection: { source: 'a', target: 'gone' } }], { nodes, edges }),
    ).toBe(edges);
  });

  it('takes the handles of the new connection and clears the ones it omits', () => {
    const nodes = [node('a'), node('b')];
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }];

    const [edge] = reconnectEdges(
      [{ edge: { id: 'edge' }, connection: { source: 'a', target: 'b', targetHandle: 'in-2' } }],
      {
        nodes,
        edges,
      },
    );

    expect(edge.sourceHandle).toBeUndefined();
    expect(edge.targetHandle).toBe('in-2');
  });
});
