import { clientToFlowPosition, flowToClientPosition } from './coordinates';

describe('coordinate utilities', () => {
  const options = {
    viewport: { x: -40, y: 25, zoom: 2 },
    containerPosition: { x: 120, y: 80 },
  };

  it('maps a client position to flow space by removing the container offset and the pan, then dividing by zoom', () => {
    // x: (500 - 120 - (-40)) / 2, y: (345 - 80 - 25) / 2
    expect(clientToFlowPosition({ x: 500, y: 345 }, options)).toEqual({ x: 210, y: 120 });
  });

  it('maps a flow position to client space by scaling, then adding the pan and the container offset', () => {
    // x: 120 + (-40) + 210 * 2, y: 80 + 25 + 120 * 2
    expect(flowToClientPosition({ x: 210, y: 120 }, options)).toEqual({ x: 500, y: 345 });
  });

  it('round-trips a position at a fractional zoom', () => {
    const fractional = { ...options, viewport: { x: -40, y: 25, zoom: 1.625 } };
    const client = { x: 487.25, y: 341.5 };

    const roundTrip = flowToClientPosition(clientToFlowPosition(client, fractional), fractional);

    expect(roundTrip.x).toBeCloseTo(client.x, 10);
    expect(roundTrip.y).toBeCloseTo(client.y, 10);
  });

  describe.each([
    ['clientToFlowPosition', clientToFlowPosition],
    ['flowToClientPosition', flowToClientPosition],
  ])('%s', (_, convert) => {
    it.each([0, -1, NaN, Infinity])('throws a RangeError for the zoom %s', (zoom) => {
      expect(() => convert({ x: 1, y: 1 }, { ...options, viewport: { x: 0, y: 0, zoom } })).toThrowError(RangeError);
    });
  });
});
