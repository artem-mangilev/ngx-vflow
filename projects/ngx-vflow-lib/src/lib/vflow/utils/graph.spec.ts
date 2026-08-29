import { signal } from '@angular/core';
import { Edge } from '../interfaces/edge.interface';
import { Node } from '../interfaces/node.interface';
import { getConnectedEdges, getIncomers, getNodesBounds, getOutgoers } from './graph';

function node(id: string, x = 0, y = 0, parentId?: string, width?: number, height?: number): Node<unknown> {
  return {
    id,
    type: 'default',
    point: signal({ x, y }),
    ...(parentId ? { parentId: signal(parentId) } : {}),
    ...(width === undefined ? {} : { width: signal(width) }),
    ...(height === undefined ? {} : { height: signal(height) }),
  };
}

describe('graph utilities', () => {
  it('queries node-level topology without changing input order or multiplicity', () => {
    const a = node('a');
    const b = node('b');
    const c = node('c');
    const nodes = [a, b, c];
    const edges: Edge[] = [
      { id: 'a-b-1', source: 'a', target: 'b', sourceHandle: 'one' },
      { id: 'a-b-2', source: 'a', target: 'b', sourceHandle: 'two' },
      { id: 'a-a', source: 'a', target: 'a' },
      { id: 'a-missing', source: 'a', target: 'missing' },
      { id: 'c-a', source: 'c', target: 'a' },
      { id: 'missing', source: 'missing', target: 'elsewhere' },
    ];

    expect(getConnectedEdges([a], edges)).toEqual(edges.slice(0, 5));
    expect(getOutgoers(a, nodes, edges)).toEqual([a, b]);
    expect(getIncomers(a, nodes, edges)).toEqual([a, c]);
    expect(getIncomers({ id: 'missing' }, nodes, edges)).toEqual([]);
  });

  it('calculates direct and lookup-backed nested bounds', () => {
    const parent = node('parent', 100, 100, undefined, 400, 300);
    const child = node('child', 10, 20, 'parent', 80, 40);
    const staleChild = node('child', 900, 900, 'parent', 1, 1);
    const descendant = node('descendant', 5, 5, 'child', 10, 10);
    const lookup = new Map([parent, child, descendant].map((item) => [item.id, item]));
    spyOn(console, 'warn');

    expect(getNodesBounds([child])).toEqual({ x: 10, y: 20, width: 80, height: 40 });
    expect(console.warn).toHaveBeenCalledWith('[ngx-vflow] Pass nodeLookup to get flow-space bounds for nested nodes.');
    expect(getNodesBounds([staleChild], { nodeLookup: lookup })).toEqual({
      x: 110,
      y: 120,
      width: 80,
      height: 40,
    });
    expect(getNodesBounds([parent], { nodeLookup: lookup })).toEqual({ x: 100, y: 100, width: 400, height: 300 });
  });

  it('handles empty, missing, unmeasured, incomplete, and cyclic bounds input', () => {
    const unmeasured = node('unmeasured', 5, 10);
    const orphan = node('orphan', 20, 30, 'missing', 5, 5);
    const a = node('a', 1, 2, 'b', 5, 5);
    const b = node('b', 3, 4, 'a', 5, 5);
    const lookup = new Map([unmeasured, orphan, a, b].map((item) => [item.id, item]));
    spyOn(console, 'warn');

    expect(getNodesBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(getNodesBounds([unmeasured])).toEqual({ x: 5, y: 10, width: 0, height: 0 });
    expect(getNodesBounds([orphan], { nodeLookup: lookup })).toEqual({ x: 20, y: 30, width: 5, height: 5 });
    expect(getNodesBounds([node('absent')], { nodeLookup: lookup })).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(getNodesBounds([a], { nodeLookup: lookup })).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(console.warn).toHaveBeenCalledWith('[ngx-vflow] Skipping node "a" with cyclic parent ancestry.');
  });
});
