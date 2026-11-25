import { signal } from '@angular/core';
import { Edge } from '../interfaces/edge.interface';
import { Node } from '../interfaces/node.interface';
import { getConnectedEdges, getIncomers, getOutgoers } from './graph';

function node(id: string): Node<unknown> {
  return { id, point: signal({ x: 0, y: 0 }) };
}

describe('graph utilities', () => {
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

  describe('getConnectedEdges', () => {
    it('returns every edge that touches a node, in input order', () => {
      expect(getConnectedEdges([a], edges)).toEqual(edges.slice(0, 5));
    });

    it('returns an edge once when it touches several of the nodes', () => {
      expect(getConnectedEdges([a, b], edges)).toEqual(edges.slice(0, 5));
    });

    it('returns nothing for a node without edges', () => {
      expect(getConnectedEdges([node('lonely')], edges)).toEqual([]);
    });
  });

  describe('getOutgoers', () => {
    it('returns each node the node points to once, in node order, whatever the number of edges', () => {
      expect(getOutgoers(a, nodes, edges)).toEqual([a, b]);
    });

    it('returns nothing for a node that is not in the graph', () => {
      expect(getOutgoers({ id: 'missing' }, nodes, edges)).toEqual([]);
    });
  });

  describe('getIncomers', () => {
    it('returns the nodes that point to the node, in node order', () => {
      expect(getIncomers(a, nodes, edges)).toEqual([a, c]);
    });

    it('returns nothing for a node that is not in the graph', () => {
      expect(getIncomers({ id: 'missing' }, nodes, edges)).toEqual([]);
    });
  });
});
