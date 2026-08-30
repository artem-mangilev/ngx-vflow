import { signal } from '@angular/core';
import { Node } from '../interfaces/node.interface';
import {
  clientToFlowPosition,
  flowToClientPosition,
  flowToNodeSpacePosition,
  getNodePositionInSpace,
  nodeSpaceToFlowPosition,
} from './coordinates';

function node(id: string, x: number, y: number, parentId?: string): Node {
  return {
    id,
    type: 'default',
    point: signal({ x, y }),
    ...(parentId ? { parentId: signal(parentId) } : {}),
  };
}

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
      ['parent', node('parent', 100, 50)],
      ['child', node('child', 20, 30, 'parent')],
    ]);

    expect(nodeSpaceToFlowPosition({ x: 10, y: 5 }, 'child', lookup)).toEqual({ x: 130, y: 85 });
    expect(flowToNodeSpacePosition({ x: 150, y: 100 }, 'child', lookup)).toEqual({ x: 30, y: 20 });
    expect(nodeSpaceToFlowPosition({ x: 0, y: 0 }, 'missing', lookup)).toBeUndefined();
  });

  it('gets a node position in flow or another node space', () => {
    const nodes = [node('parent', 100, 50), node('child', 20, 30, 'parent'), node('target', 40, 10)];

    expect(getNodePositionInSpace('child', null, nodes)).toEqual({ x: 120, y: 80 });
    expect(getNodePositionInSpace('child', 'target', nodes)).toEqual({ x: 80, y: 70 });
    expect(getNodePositionInSpace('missing', null, nodes)).toBeUndefined();
    expect(getNodePositionInSpace('child', 'missing', nodes)).toBeUndefined();
  });

  it('treats a missing ancestor as a root and rejects cyclic ancestry', () => {
    const orphanLookup = new Map([['orphan', node('orphan', 5, 6, 'missing')]]);
    const cycleLookup = new Map([
      ['a', node('a', 1, 2, 'b')],
      ['b', node('b', 3, 4, 'a')],
    ]);
    spyOn(console, 'warn');

    expect(nodeSpaceToFlowPosition({ x: 1, y: 1 }, 'orphan', orphanLookup)).toEqual({ x: 6, y: 7 });
    expect(nodeSpaceToFlowPosition({ x: 0, y: 0 }, 'a', cycleLookup)).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith('[ngx-vflow] Skipping node "a" with cyclic parent ancestry.');
  });
});
