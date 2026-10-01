import { signal } from '@angular/core';
import { Edge } from '../interfaces/edge.interface';
import { Node } from '../interfaces/node.interface';
import { getConnectedEdges, getIncomers, getOutgoers } from './graph';

function node(id: string): Node<unknown> {
  return { id, point: signal({ x: 0, y: 0 }) };
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
});
