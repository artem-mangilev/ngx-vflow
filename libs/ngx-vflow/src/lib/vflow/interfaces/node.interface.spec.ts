import { createNode, createNodes } from './node.interface';

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
    expect(createNode({ id: 't', point: { x: 0, y: 0 } }, { useDefaults: false }).component).toBeUndefined();
  });
});
