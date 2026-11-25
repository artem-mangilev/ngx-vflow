import { StaticEdge, createEdge, createEdges } from './edge.interface';

describe('createEdge', () => {
  const connection = { id: 'a-b', source: 'a', target: 'b' };

  it('keeps the id and the endpoints as plain values', () => {
    expect(createEdge({ ...connection, sourceHandle: 'out', targetHandle: 'in' })).toMatchObject({
      ...connection,
      sourceHandle: 'out',
      targetHandle: 'in',
    });
  });

  it.each([
    ['curve', 'bezier'],
    ['data', {}],
    ['markers', {}],
    ['reconnectable', false],
    ['selected', false],
    ['interactionWidth', 20],
  ] as const)('defaults %s', (key, value) => {
    expect(createEdge(connection)[key]()).toEqual(value);
  });

  it('takes the supplied values over the defaults', () => {
    const edge = createEdge({
      ...connection,
      curve: 'step',
      data: { n: 1 },
      markers: { end: { type: 'arrow' } },
      reconnectable: 'source',
      selected: true,
      interactionWidth: 0,
    });

    expect([
      edge.curve(),
      edge.data(),
      edge.markers(),
      edge.reconnectable(),
      edge.selected(),
      edge.interactionWidth(),
    ]).toEqual(['step', { n: 1 }, { end: { type: 'arrow' } }, 'source', true, 0]);
  });

  it('has no handle ids, so the edge connects to the first handles of its nodes', () => {
    const edge = createEdge(connection);

    expect(edge.sourceHandle).toBeUndefined();
    expect(edge.targetHandle).toBeUndefined();
  });

  it.each(['selectable', 'focusable', 'ariaLabel', 'ariaDescription', 'domAttributes'] as const)(
    'adds the optional %s only when it is supplied',
    (key) => {
      const supplied = {
        selectable: false,
        focusable: false,
        ariaLabel: 'label',
        ariaDescription: 'description',
        domAttributes: { role: 'x' },
      };

      expect(createEdge(connection)[key]).toBeUndefined();
      expect(createEdge({ ...connection, [key]: supplied[key] })[key]!()).toEqual(supplied[key]);
    },
  );

  it('keeps a component key or class as given', () => {
    class Probe {}

    expect(createEdge({ ...connection, component: Probe }).component).toBe(Probe);
    expect(createEdge(connection).component).toBeUndefined();
  });
});

describe('createEdges', () => {
  it('creates an edge for each static edge, in order', () => {
    const edges = createEdges([
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'b-c', source: 'b', target: 'c' },
    ]);

    expect(edges.map((edge) => edge.id)).toEqual(['a-b', 'b-c']);
  });

  it('creates nothing from an empty list', () => {
    expect(createEdges([])).toEqual([]);
  });
});

describe('createEdges data type (checked by the type check of the spec build)', () => {
  interface Dependency {
    blocking: boolean;
  }
  // Edges built by helpers are not fresh literals: the data type comes from each edge.
  const dependency = (id: string): StaticEdge<Dependency> => ({
    id,
    source: 'a',
    target: 'b',
    data: { blocking: true },
  });
  const label = (id: string) => ({ id, source: 'b', target: 'c', curve: 'step' as const, data: { text: id } });

  it('types the data as the union of the data of edges of different kinds', () => {
    const edges = createEdges([dependency('a-b'), label('b-c'), { id: 'c-d', source: 'c', target: 'd' }]);
    expectTypeOf(edges[0].data()).toEqualTypeOf<Dependency | { text: string }>();
    expect(edges.map((edge) => edge.data())).toEqual([{ blocking: true }, { text: 'b-c' }, {}]);
  });

  it('types the data as unknown when no edge has data', () => {
    expectTypeOf(createEdges([{ id: 'a-b', source: 'a', target: 'b' }])[0].data()).toBeUnknown();
  });

  it('types the data as the type argument when one is given, and checks every edge against it', () => {
    expectTypeOf(
      createEdges<Dependency>([
        dependency('a-b'),
        { id: 'b-c', source: 'b', target: 'c', data: { blocking: false } },
      ])[0].data(),
    ).toEqualTypeOf<Dependency>();
    // @ts-expect-error a label is not a dependency
    createEdges<Dependency>([dependency('a-b'), label('b-c')]);
    // @ts-expect-error the curve is still checked without a type argument; a string is a key until `VflowCurves` is augmented
    createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: 42 }]);
  });
});
