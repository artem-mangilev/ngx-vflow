import { StaticEdge, createEdges } from './edge.interface';

describe('createEdges data type', () => {
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

  it('is the union of the data of edges of different kinds', () => {
    const edges = createEdges([dependency('a-b'), label('b-c'), { id: 'c-d', source: 'c', target: 'd' }]);
    expectTypeOf(edges[0].data()).toEqualTypeOf<Dependency | { text: string }>();
    expect(edges.map((edge) => edge.data())).toEqual([{ blocking: true }, { text: 'b-c' }, {}]);
  });

  it('is unknown when no edge has data', () => {
    expectTypeOf(createEdges([{ id: 'a-b', source: 'a', target: 'b' }])[0].data()).toBeUnknown();
  });

  it('is the type argument when one is given, and checks every edge against it', () => {
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
