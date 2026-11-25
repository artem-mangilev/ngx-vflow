import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { ReferenceIdentityChecker } from './identity-checker/reference-identity-checker';

function node(id: string, x = 0, y = 0, parentId?: string | null): Node {
  return {
    id,
    point: signal({ x, y }),
    parentId: signal(parentId ?? null),
  };
}

describe('addNodes', () => {
  it('appends a node after the one it names as parent', () => {
    const parent = node('parent');
    const child = node('child', 0, 0, 'parent');

    expect(addNodes([parent, child], [])).toEqual([parent, child]);
  });

  it('skips a node whose parent comes later in the input', () => {
    const parent = node('parent');
    const child = node('child', 0, 0, 'parent');

    expect(addNodes([child, parent], [])).toEqual([parent]);
  });

  it('keeps the collection reference when every node is a duplicate', () => {
    const existing = [node('parent')];

    expect(addNodes([node('parent')], existing)).toBe(existing);
  });

  it('skips a node without an id', () => {
    const existing = [node('a')];

    expect(addNodes([node('')], existing)).toBe(existing);
  });
});

describe('addEdges', () => {
  it('appends edges in input order and keeps their objects', () => {
    const nodes = [node('a'), node('b')];
    const selected = signal(true);
    const first: Edge = { id: 'first', source: 'a', target: 'b', selected };
    const withHandles: Edge = { id: 'handles', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' };

    const added = addEdges([first, withHandles], { nodes, edges: [] });

    expect(added).toEqual([first, withHandles]);
    expect(added[0]).toBe(first);
    expect(added[0].selected).toBe(selected);
  });

  it('rejects an edge to a missing node and keeps the collection reference', () => {
    const edges: Edge[] = [];

    expect(addEdges([{ id: 'edge', source: 'a', target: 'missing' }], { nodes: [node('a')], edges })).toBe(edges);
  });

  it('rejects an edge to an ambiguous node id', () => {
    const edges: Edge[] = [];

    expect(
      addEdges([{ id: 'edge', source: 'a', target: 'b' }], { nodes: [node('a'), node('b'), node('b')], edges }),
    ).toBe(edges);
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
});

describe('removeElements', () => {
  it('removes the descendants of a node and the edges incident to any removed node, in collection order', () => {
    const child = node('child', 10, 10, 'parent');
    const unrelated = node('unrelated');
    const parent = node('parent');
    const descendant = node('descendant', 5, 5, 'child');
    const keep: Edge = { id: 'keep', source: 'unrelated', target: 'missing' };
    const childEdge: Edge = { id: 'child-edge', source: 'child', target: 'unrelated' };
    const parentEdge: Edge = { id: 'parent-edge', source: 'unrelated', target: 'parent' };

    const result = removeElements(
      { nodeIds: ['parent'] },
      { nodes: [child, unrelated, parent, descendant], edges: [keep, childEdge, parentEdge] },
    );

    expect(result.nodes).toEqual([unrelated]);
    expect(result.edges).toEqual([keep]);
    expect(result.removedNodes).toEqual([child, parent, descendant]);
    expect(result.removedEdges).toEqual([childEdge, parentEdge]);
  });

  it('keeps the collections when the id is unknown', () => {
    const nodes = [node('a')];
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'a' }];

    expect(removeElements({ nodeIds: ['missing'] }, { nodes, edges })).toEqual({
      nodes,
      edges,
      removedNodes: [],
      removedEdges: [],
    });
  });

  it('keeps the node collection when only edges are removed', () => {
    const nodes = [node('a'), node('b')];
    const ab: Edge = { id: 'a-b', source: 'a', target: 'b' };
    const ba: Edge = { id: 'b-a', source: 'b', target: 'a' };

    const result = removeElements({ edgeIds: ['a-b'] }, { nodes, edges: [ab, ba] });

    expect(result.nodes).toBe(nodes);
    expect(result.edges).toEqual([ba]);
    expect(result.removedEdges).toEqual([ab]);
  });

  it('reports an edge once when it is requested and also incident to a removed node', () => {
    const a = node('a');
    const b = node('b');
    const c = node('c');
    const ab: Edge = { id: 'a-b', source: 'a', target: 'b' };
    const bc: Edge = { id: 'b-c', source: 'b', target: 'c' };
    const ca: Edge = { id: 'c-a', source: 'c', target: 'a' };

    const result = removeElements(
      { nodeIds: ['a'], edgeIds: ['b-c', 'a-b'] },
      { nodes: [a, b, c], edges: [ab, bc, ca] },
    );

    expect(result.removedNodes).toEqual([a]);
    expect(result.removedEdges).toEqual([ab, bc, ca]);
    expect(result.edges).toEqual([]);
  });

  it('removes a parent cycle without looping', () => {
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

    // The first "duplicate" is ambiguous and skipped; removing the parent takes one of them; the last one is unique.
    const result = removeElements({ nodeIds: ['duplicate', 'parent', 'duplicate'] }, { nodes, edges: [] });

    expect(result.nodes).toEqual([]);
    expect(result.removedNodes).toEqual(nodes);
  });
});

describe('removeEdges', () => {
  const duplicateA: Edge = { id: 'duplicate', source: 'a', target: 'b' };
  const duplicateB: Edge = { id: 'duplicate', source: 'b', target: 'a' };
  const keep: Edge = { id: 'keep', source: 'a', target: 'a' };
  const edges = [duplicateA, keep, duplicateB];

  it('removes an edge that has a unique id', () => {
    expect(removeEdges(['keep'], edges)).toEqual([duplicateA, duplicateB]);
  });

  it('keeps the collection reference when the id is ambiguous', () => {
    expect(removeEdges(['duplicate'], edges)).toBe(edges);
  });

  it('keeps the collection reference when the id is unknown', () => {
    expect(removeEdges(['missing'], edges)).toBe(edges);
  });
});

describe('reparentNodes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });
  });

  it('moves a node under a new parent and keeps its flow position', () => {
    const oldParent = node('old-parent', 100, 100);
    const newParent = node('new-parent', 300, 50);
    const child = node('child', 10, 20, 'old-parent');

    reparentNodes([{ id: 'child', parentId: 'new-parent' }], [oldParent, child, newParent]);

    expect(child.parentId?.()).toBe('new-parent');
    // The flow position (110, 120) is the same, relative to the new parent at (300, 50).
    expect(child.point()).toEqual({ x: -190, y: 70 });
  });

  it('moves the node to the root with its flow position as the point', () => {
    const parent = node('parent', 100, 100);
    const child = node('child', 10, 20, 'parent');

    reparentNodes([{ id: 'child', parentId: null }], [parent, child]);

    expect(child.parentId?.()).toBeNull();
    expect(child.point()).toEqual({ x: 110, y: 120 });
  });

  it('returns a new array holding the same node objects and signals', () => {
    const selected = signal(true);
    const child = { ...node('child', 10, 20, 'old-parent'), selected };
    const { point, parentId } = child;
    const nodes = [node('old-parent', 100, 100), child, node('new-parent', 300, 50)];

    const result = reparentNodes([{ id: 'child', parentId: 'new-parent' }], nodes);

    expect(result).not.toBe(nodes);
    expect(result[1]).toBe(child);
    expect(child.point).toBe(point);
    expect(child.parentId).toBe(parentId);
    expect(child.selected).toBe(selected);
  });

  it('keeps the descendants of the moved node in place', () => {
    const child = node('child', 10, 20, 'old-parent');
    const descendant = node('descendant', 5, 5, 'child');

    reparentNodes(
      [{ id: 'child', parentId: 'new-parent' }],
      [node('old-parent', 100, 100), child, descendant, node('new-parent', 300, 50)],
    );

    expect(descendant.point()).toEqual({ x: 5, y: 5 });
    expect(descendant.parentId?.()).toBe('child');
  });

  it('keeps the collection reference when the node already has that parent', () => {
    const nodes = [node('parent'), node('child', 0, 0, 'parent')];

    expect(reparentNodes([{ id: 'child', parentId: 'parent' }], nodes)).toBe(nodes);
  });

  it('keeps the collection reference for an unknown node or an unknown parent', () => {
    const nodes = [node('a')];

    expect(reparentNodes([{ id: 'missing', parentId: null }], nodes)).toBe(nodes);
    expect(reparentNodes([{ id: 'a', parentId: 'missing' }], nodes)).toBe(nodes);
  });

  it('rejects a descendant as the new parent', () => {
    const nodes = [node('parent'), node('child', 0, 0, 'parent')];

    expect(reparentNodes([{ id: 'parent', parentId: 'child' }], nodes)).toBe(nodes);
  });

  it('rejects a node whose ancestry is a cycle', () => {
    const nodes = [node('cycle-a', 0, 0, 'cycle-b'), node('cycle-b', 0, 0, 'cycle-a')];

    expect(reparentNodes([{ id: 'cycle-a', parentId: null }], nodes)).toBe(nodes);
  });

  it('adds a parent signal to a node that had none', () => {
    const child: Node = { id: 'child', point: signal({ x: 10, y: 20 }) };

    const result = reparentNodes([{ id: 'child', parentId: 'parent' }], [child, node('parent', 100, 50)]);

    expect(result[0]).toBe(child);
    expect(child.parentId?.()).toBe('parent');
    expect(child.point()).toEqual({ x: -90, y: -30 });
  });

  it('preserves the rendered position when it adds an omitted parentId signal', () => {
    const parent = createNode({ id: 'parent', point: { x: 100, y: 0 } });
    const child: Node = { id: 'child', point: signal({ x: 150, y: 0 }) };
    const entities = TestBed.inject(FlowEntitiesService);
    const models = TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes([parent, child], []));
    entities.nodes.set(models);
    expect(models[1].globalPoint()).toEqual({ x: 150, y: 0 });

    const next = reparentNodes([{ id: 'child', parentId: 'parent' }], [parent, child]);
    entities.nodes.set(TestBed.runInInjectionContext(() => ReferenceIdentityChecker.nodes(next, models)));

    expect(entities.nodes()[1].globalPoint()).toEqual({ x: 150, y: 0 });
  });
});

describe('reconnectEdges', () => {
  it('replaces the connection in place and keeps the id, metadata and signals', () => {
    const selected = signal(true);
    const before: Edge = { id: 'before', source: 'a', target: 'b' };
    const edge: Edge = { id: 'edge', source: 'a', target: 'b', selected, sourceHandle: 'old' };
    const after: Edge = { id: 'after', source: 'b', target: 'a' };

    const result = reconnectEdges(
      [{ edge: { id: 'edge' }, connection: { source: 'b', target: 'a', sourceHandle: 'out', targetHandle: 'in' } }],
      { nodes: [node('a'), node('b')], edges: [before, edge, after] },
    );

    expect(result[0]).toBe(before);
    expect(result[2]).toBe(after);
    expect(result[1]).toEqual({ ...edge, source: 'b', target: 'a', sourceHandle: 'out', targetHandle: 'in' });
    expect(result[1].selected).toBe(selected);
  });

  it('applies a reconnect event of the gesture', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const edge: Edge = { id: 'edge', source: 'a', target: 'b' };
    const event: ReconnectEvent = { edge, connection: { source: 'a', target: 'c' } };

    const [reconnected] = reconnectEdges([event], { nodes, edges: [edge] });

    expect(reconnected).toEqual({ ...edge, target: 'c' });
  });

  it('takes the handles of the new connection and clears the ones it omits', () => {
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }];

    const [edge] = reconnectEdges(
      [{ edge: { id: 'edge' }, connection: { source: 'a', target: 'b', targetHandle: 'in-2' } }],
      { nodes: [node('a'), node('b')], edges },
    );

    expect(edge.sourceHandle).toBeUndefined();
    expect(edge.targetHandle).toBe('in-2');
  });

  describe('keeps the collection reference', () => {
    const nodes = [node('a'), node('b')];
    const edges: Edge[] = [{ id: 'edge', source: 'a', target: 'b' }];

    it.each<[string, Parameters<typeof reconnectEdges>[0]]>([
      ['the edge is unknown', [{ edge: { id: 'missing' }, connection: { source: 'b', target: 'a' } }]],
      ['an endpoint is unknown', [{ edge: { id: 'edge' }, connection: { source: 'a', target: 'gone' } }]],
      ['the connection is the current one', [{ edge: { id: 'edge' }, connection: { source: 'a', target: 'b' } }]],
    ])('when %s', (_, operations) => {
      expect(reconnectEdges(operations, { nodes, edges })).toBe(edges);
    });
  });
});
