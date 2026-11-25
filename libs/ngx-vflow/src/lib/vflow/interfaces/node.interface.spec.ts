import { StaticNode, createNode, createNodes } from './node.interface';

describe('createNode', () => {
  const point = { x: 5, y: 6 };

  it('wraps the point into a signal', () => {
    expect(createNode({ id: 'a', point }).point()).toEqual(point);
  });

  it.each([
    ['data', 'data', {}],
    ['draggable', 'draggable', true],
    ['parentId', 'parentId', null],
    ['extent', 'extent', 'parent'],
    ['selected', 'selected', false],
  ] as const)('defaults %s', (_, key, value) => {
    expect(createNode({ id: 'a', point })[key]!()).toEqual(value);
  });

  it('takes the supplied values over the defaults', () => {
    const node = createNode({
      id: 'a',
      point,
      data: { title: 'x' },
      draggable: false,
      parentId: 'group',
      extent: null,
      selected: true,
    });

    expect([node.data(), node.draggable(), node.parentId(), node.extent(), node.selected()]).toEqual([
      { title: 'x' },
      false,
      'group',
      null,
      true,
    ]);
  });

  it('leaves a node without a size so it stays content-sized', () => {
    const node = createNode({ id: 'a', point });

    expect(node.width).toBeUndefined();
    expect(node.height).toBeUndefined();
  });

  it('wraps an application-provided size into signals', () => {
    const node = createNode({ id: 'a', point, width: 30, height: 40 });

    expect([node.width?.(), node.height?.()]).toEqual([30, 40]);
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

      expect(createNode({ id: 'a', point })[key]).toBeUndefined();
      expect(createNode({ id: 'a', point, [key]: supplied[key] })[key]!()).toEqual(supplied[key]);
    },
  );

  it('passes a component or a lazy factory through without wrapping it into a signal', () => {
    const factory = () => Promise.resolve(class {});

    expect(createNode({ id: 'c', component: factory, point }).component).toBe(factory);
  });

  it('has no component when none is given', () => {
    expect(createNode({ id: 't', point }).component).toBeUndefined();
  });

  it('creates independent signals for every node', () => {
    const [first, second] = createNodes([
      { id: 'a', point },
      { id: 'b', point },
    ]);

    first.data.set({ changed: true });

    expect(second.data()).toEqual({});
  });
});

describe('createNodes', () => {
  it('creates a node for each static node, in order', () => {
    const nodes = createNodes([
      { id: 'a', point: { x: 0, y: 0 } },
      { id: 'b', point: { x: 1, y: 1 } },
    ]);

    expect(nodes.map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('creates nothing from an empty list', () => {
    expect(createNodes([])).toEqual([]);
  });
});

describe('createNodes data type (checked by the type check of the spec build)', () => {
  interface Team {
    title: string;
  }
  const point = { x: 0, y: 0 };
  // Nodes built by helpers are not fresh literals: the data type comes from each node.
  const team = (id: string): StaticNode<Team> => ({ id, point, data: { title: id } });
  const person = (id: string) => ({ id, point, extent: 'parent' as const, data: { name: id } });

  it('types the data as the union of the data of nodes of different kinds', () => {
    const nodes = createNodes([team('a'), person('b'), { id: 'c', point }]);
    expectTypeOf(nodes[0].data()).toEqualTypeOf<Team | { name: string }>();
    expect(nodes.map((node) => node.data())).toEqual([{ title: 'a' }, { name: 'b' }, {}]);
  });

  it('types the data as unknown when no node has data', () => {
    expectTypeOf(createNodes([{ id: 'a', point }])[0].data()).toBeUnknown();
  });

  it('types the data as the type argument when one is given, and checks every node against it', () => {
    expectTypeOf(
      createNodes<Team>([team('a'), { id: 'b', point, data: { title: 'b' } }])[0].data(),
    ).toEqualTypeOf<Team>();
    // @ts-expect-error a person is not a team
    createNodes<Team>([team('a'), person('b')]);
    // @ts-expect-error extent is still checked without a type argument
    createNodes([{ id: 'a', point, extent: 'parnet' }]);
  });
});
