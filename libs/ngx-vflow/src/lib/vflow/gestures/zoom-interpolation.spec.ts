import { easeCubicInOut, interpolateViewport } from './zoom-interpolation';

/** Values recorded from d3-zoom 3.0 (`interpolateZoom`, `easeCubicInOut`, `defaultWheelDelta`) before its removal. */
const D3_TRANSITIONS = [
  {
    from: { x: -300, y: -100, zoom: 0.6 },
    to: { x: -100, y: -175, zoom: 3 },
    anchor: { x: 500, y: 350 },
    size: 1000,
    frames: [
      { t: 0, x: -300, y: -100, zoom: 0.6 },
      { t: 0.25, x: 54.113351273, y: 82.026408211, zoom: 0.567822972 },
      { t: 0.5, x: 177.358539938, y: 125.303268886, zoom: 0.829649469 },
      { t: 0.75, x: 133.548623279, y: 52.238181209, zoom: 1.521046236 },
      { t: 0.999, x: -98.568578174, y: -173.663135544, zoom: 2.991695454 },
      { t: 1, x: -100, y: -175, zoom: 3 },
    ],
  },
  {
    from: { x: 0, y: 0, zoom: 1 },
    to: { x: -500, y: -350, zoom: 2 },
    anchor: { x: 500, y: 350 },
    size: 1000,
    frames: [
      { t: 0, x: 0, y: 0, zoom: 1 },
      { t: 0.25, x: -94.603557501, y: -66.222490251, zoom: 1.189207115 },
      { t: 0.5, x: -207.106781187, y: -144.974746831, zoom: 1.414213562 },
      { t: 0.75, x: -340.896415254, y: -238.627490678, zoom: 1.681792831 },
      { t: 0.999, x: -499.30709299, y: -349.514965093, zoom: 1.998614186 },
      { t: 1, x: -500, y: -350, zoom: 2 },
    ],
  },
  {
    from: { x: 0, y: 0, zoom: 1 },
    to: { x: 200, y: 100, zoom: 1 },
    anchor: { x: 500, y: 350 },
    size: 1000,
    frames: [
      { t: 0, x: 0, y: 0, zoom: 1 },
      { t: 0.25, x: 57.543230808, y: 30.580958381, zoom: 0.98190657 },
      { t: 0.5, x: 109.639970821, y: 57.229978115, zoom: 0.975900073 },
      { t: 0.75, x: 156.931513006, y: 80.27509948, zoom: 0.98190657 },
      { t: 0.999, x: 199.835419783, y: 99.927379507, zoom: 0.999903304 },
      { t: 1, x: 200, y: 100, zoom: 1 },
    ],
  },
  {
    from: { x: 10, y: 20, zoom: 1.5 },
    to: { x: 10, y: 20, zoom: 1.5 },
    anchor: { x: 500, y: 350 },
    size: 1000,
    frames: [
      { t: 0, x: 10, y: 20, zoom: 1.5 },
      { t: 0.25, x: 10, y: 20, zoom: 1.5 },
      { t: 0.5, x: 10, y: 20, zoom: 1.5 },
      { t: 0.75, x: 10, y: 20, zoom: 1.5 },
      { t: 0.999, x: 10, y: 20, zoom: 1.5 },
      { t: 1, x: 10, y: 20, zoom: 1.5 },
    ],
  },
  {
    from: { x: 0, y: 0, zoom: 1 },
    to: { x: -600, y: -350, zoom: 2 },
    anchor: { x: 600, y: 350 },
    size: 1000,
    frames: [
      { t: 0, x: 0, y: 0, zoom: 1 },
      { t: 0.25, x: -113.524269002, y: -66.222490251, zoom: 1.189207115 },
      { t: 0.5, x: -248.528137424, y: -144.974746831, zoom: 1.414213562 },
      { t: 0.75, x: -409.075698304, y: -238.627490678, zoom: 1.681792831 },
      { t: 0.999, x: -599.168511589, y: -349.514965093, zoom: 1.998614186 },
      { t: 1, x: -600, y: -350, zoom: 2 },
    ],
  },
];

describe('zoom interpolation', () => {
  it.each([
    [0, 0],
    [0.1, 0.004],
    [0.25, 0.0625],
    [0.5, 0.5],
    [0.75, 0.9375],
    [0.9, 0.996],
    [1, 1],
  ])('eases in and out cubically: %d is %d', (t, expected) => {
    expect(easeCubicInOut(t)).toBeCloseTo(expected, 9);
  });

  it.each(
    D3_TRANSITIONS.flatMap(({ from, to, anchor, size, frames }) =>
      frames.map((frame) => ({ from, to, anchor, size, frame })),
    ),
  )('follows the d3 zoom transition from $from to $to at $frame.t', ({ from, to, anchor, size, frame }) => {
    const state = interpolateViewport(from, to, anchor, size)(frame.t);

    expect(state.x).toBeCloseTo(frame.x, 6);
    expect(state.y).toBeCloseTo(frame.y, 6);
    expect(state.zoom).toBeCloseTo(frame.zoom, 9);
  });

  it('ends exactly on the target', () => {
    const to = { x: -100.123, y: 7.5, zoom: 2.25 };
    expect(interpolateViewport({ x: 0, y: 0, zoom: 1 }, to, { x: 50, y: 50 }, 100)(1)).toBe(to);
  });
});
