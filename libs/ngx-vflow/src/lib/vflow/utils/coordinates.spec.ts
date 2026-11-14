import { clientToFlowPosition, flowToClientPosition } from './coordinates';

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
});
