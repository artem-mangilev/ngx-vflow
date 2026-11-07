import { StaticNode, createNode, createNodes } from './node.interface';

describe('createNode size defaults', () => {
  it('leaves nodes without a size so they stay content-sized', () => {
    const node = createNode({ id: 'a', point: { x: 0, y: 0 } });
    expect(node.width).toBeUndefined();
    expect(node.height).toBeUndefined();
    expect(node.data?.()).toEqual({});
  });

  it('wraps an application-provided size into signals', () => {
    const [node] = createNodes([{ id: 'a', point: { x: 0, y: 0 }, width: 30, height: 40 }]);
    expect(node.width?.()).toBe(30);
    expect(node.height?.()).toBe(40);
  });

  it('passes a component or a lazy factory through without wrapping it into a signal', () => {
    const factory = () => Promise.resolve(class {});
    expect(createNode({ id: 'c', component: factory, point: { x: 0, y: 0 } }).component).toBe(factory);
    expect(createNode({ id: 't', point: { x: 0, y: 0 } }).component).toBeUndefined();
  });
});

describe('createNodes data type', () => {
  interface Team {
    title: string;
  }
  const point = { x: 0, y: 0 };
  // Nodes built by helpers are not fresh literals: the data type comes from each node.
  const team = (id: string): StaticNode<Team> => ({ id, point, data: { title: id } });
  const person = (id: string) => ({ id, point, extent: 'parent' as const, data: { name: id } });

  it('is the union of the data of nodes of different kinds', () => {
    const nodes = createNodes([team('a'), person('b'), { id: 'c', point }]);
    expectTypeOf(nodes[0].data()).toEqualTypeOf<Team | { name: string }>();
    expect(nodes.map((node) => node.data())).toEqual([{ title: 'a' }, { name: 'b' }, {}]);
  });

  it('is unknown when no node has data', () => {
    expectTypeOf(createNodes([{ id: 'a', point }])[0].data()).toBeUnknown();
  });

  it('is the type argument when one is given, and checks every node against it', () => {
    expectTypeOf(
      createNodes<Team>([team('a'), { id: 'b', point, data: { title: 'b' } }])[0].data(),
    ).toEqualTypeOf<Team>();
    // @ts-expect-error a person is not a team
    createNodes<Team>([team('a'), person('b')]);
    // @ts-expect-error extent is still checked without a type argument
    createNodes([{ id: 'a', point, extent: 'parnet' }]);
  });
});
