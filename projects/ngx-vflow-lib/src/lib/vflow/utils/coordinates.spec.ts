import {
  clientToFlowPosition,
  flowToClientPosition,
  flowToNodeSpacePosition,
  nodeSpaceToFlowPosition,
} from './coordinates';

describe('coordinate utilities', () => {
  it('round-trips client and flow positions with translation and non-unit zoom', () => {
    const options = {
      viewport: { x: -40, y: 25, zoom: 1.625 },
      containerPosition: { x: 120, y: 80 },
    };
    const client = { x: 487.25, y: 341.5 };

    const roundTrip = flowToClientPosition(clientToFlowPosition(client, options), options);

    expect(roundTrip.x).toBeCloseTo(client.x, 10);
    expect(roundTrip.y).toBeCloseTo(client.y, 10);
    expect(() => clientToFlowPosition(client, { ...options, viewport: { x: 0, y: 0, zoom: 0 } })).toThrowError(
      RangeError,
    );
  });

  it('converts positions through nested node spaces', () => {
    const lookup = new Map([
      ['parent', { id: 'parent', point: () => ({ x: 100, y: 50 }) }],
      ['child', { id: 'child', point: () => ({ x: 20, y: 30 }), parentId: () => 'parent' }],
    ]);

    expect(nodeSpaceToFlowPosition({ x: 10, y: 5 }, 'child', lookup)).toEqual({ x: 130, y: 85 });
    expect(flowToNodeSpacePosition({ x: 150, y: 100 }, 'child', lookup)).toEqual({ x: 30, y: 20 });
    expect(nodeSpaceToFlowPosition({ x: 0, y: 0 }, 'missing', lookup)).toBeUndefined();
  });

  it('treats a missing ancestor as a root and rejects cyclic ancestry', () => {
    const orphanLookup = new Map([
      ['orphan', { id: 'orphan', point: () => ({ x: 5, y: 6 }), parentId: () => 'missing' }],
    ]);
    const cycleLookup = new Map([
      ['a', { id: 'a', point: () => ({ x: 1, y: 2 }), parentId: () => 'b' }],
      ['b', { id: 'b', point: () => ({ x: 3, y: 4 }), parentId: () => 'a' }],
    ]);
    spyOn(console, 'warn');

    expect(nodeSpaceToFlowPosition({ x: 1, y: 1 }, 'orphan', orphanLookup)).toEqual({ x: 6, y: 7 });
    expect(nodeSpaceToFlowPosition({ x: 0, y: 0 }, 'a', cycleLookup)).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith('[ngx-vflow] Skipping node "a" with cyclic parent ancestry.');
  });
});
