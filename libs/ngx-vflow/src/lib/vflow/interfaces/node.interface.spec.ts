import { createNode, createNodes } from './node.interface';

describe('createNode size defaults', () => {
  it('leaves html and component nodes without a size so they stay content-sized', () => {
    const node = createNode({ id: 'a', type: 'html-template', point: { x: 0, y: 0 } });
    expect(node.width).toBeUndefined();
    expect(node.height).toBeUndefined();
    expect(node.data?.()).toEqual({});
  });

  it('wraps an application-provided size into signals', () => {
    const [node] = createNodes([{ id: 'a', type: 'html-template', point: { x: 0, y: 0 }, width: 30, height: 40 }]);
    expect(node.width?.()).toBe(30);
    expect(node.height?.()).toBe(40);
  });

  it('keeps the mandatory size of template groups', () => {
    const node = createNode({ id: 'g', type: 'template-group', point: { x: 0, y: 0 }, width: 300, height: 200 });
    expect(node.width!()).toBe(300);
    expect(node.height!()).toBe(200);
  });
});
