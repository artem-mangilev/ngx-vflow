import { getNodeEndpoint } from './node-endpoint';

describe('getNodeEndpoint', () => {
  const node = { x: 0, y: 0, width: 100, height: 50 };

  it('takes the middle of the side that faces the other end', () => {
    expect(getNodeEndpoint(node, { x: 300, y: 25 }, 'auto')).toEqual({ point: { x: 100, y: 25 }, position: 'right' });
    expect(getNodeEndpoint(node, { x: -100, y: 25 }, 'auto')).toEqual({ point: { x: 0, y: 25 }, position: 'left' });
    expect(getNodeEndpoint(node, { x: 50, y: -200 }, 'auto')).toEqual({ point: { x: 50, y: 0 }, position: 'top' });
    expect(getNodeEndpoint(node, { x: 50, y: 300 }, 'auto')).toEqual({ point: { x: 50, y: 50 }, position: 'bottom' });
  });

  it('picks a horizontal side on a diagonal and for the node center itself', () => {
    expect(getNodeEndpoint(node, { x: 150, y: 125 }, 'auto').position).toBe('right');
    expect(getNodeEndpoint(node, { x: -50, y: -75 }, 'auto').position).toBe('left');
    expect(getNodeEndpoint(node, { x: 50, y: 25 }, 'auto').position).toBe('right');
  });

  it('keeps the center point and still reports the facing side in the center mode', () => {
    expect(getNodeEndpoint(node, { x: 50, y: -200 }, 'center')).toEqual({ point: { x: 50, y: 25 }, position: 'top' });
    expect(getNodeEndpoint({ ...node, x: 10, y: 20 }, { x: 500, y: 45 }, 'center')).toEqual({
      point: { x: 60, y: 45 },
      position: 'right',
    });
  });
});
