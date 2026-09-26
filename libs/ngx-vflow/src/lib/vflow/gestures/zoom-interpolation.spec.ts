import { easeCubicInOut, interpolateViewport } from './zoom-interpolation';
import { wheelPanDelta, wheelZoomFactor } from './wheel';
import { clampZoom, toFlowPoint, toPanePoint, translateBy, zoomAround } from './viewport-transform';

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

describe('viewport math', () => {
  it('converts between pane and flow points', () => {
    const state = { x: 30, y: -20, zoom: 2 };
    expect(toFlowPoint(state, { x: 130, y: 80 })).toEqual({ x: 50, y: 50 });
    expect(toPanePoint(state, { x: 50, y: 50 })).toEqual({ x: 130, y: 80 });
  });

  it('zooms around a pane point that stays in place', () => {
    const state = { x: 10, y: 20, zoom: 1 };
    const next = zoomAround(state, 2, { x: 110, y: 70 });
    expect(next).toEqual({ x: -90, y: -30, zoom: 2 });
    expect(toPanePoint(next, toFlowPoint(state, { x: 110, y: 70 }))).toEqual({ x: 110, y: 70 });
    expect(zoomAround(state, 1, { x: 5, y: 5 })).toBe(state);
  });

  it('translates in pane pixels and clamps zoom', () => {
    expect(translateBy({ x: 1, y: 2, zoom: 3 }, 10, -5)).toEqual({ x: 11, y: -3, zoom: 3 });
    expect(clampZoom(10, 0.5, 3)).toBe(3);
    expect(clampZoom(0.1, 0.5, 3)).toBe(0.5);
  });
});

describe('wheel', () => {
  it('matches the d3 wheel zoom factors', () => {
    expect(wheelZoomFactor({ deltaX: 0, deltaY: -100, deltaMode: 0, ctrlKey: false })).toBeCloseTo(1.148698355, 9);
    expect(wheelZoomFactor({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: false })).toBeCloseTo(0.870550563, 9);
    expect(wheelZoomFactor({ deltaX: 0, deltaY: -3, deltaMode: 1, ctrlKey: false })).toBeCloseTo(1.109569472, 9);
    expect(wheelZoomFactor({ deltaX: 0, deltaY: 1, deltaMode: 2, ctrlKey: false })).toBeCloseTo(0.5, 9);
    expect(wheelZoomFactor({ deltaX: 0, deltaY: -10, deltaMode: 0, ctrlKey: true })).toBeCloseTo(1.148698355, 9);
  });

  it('scroll-pans by pixels, 16-pixel lines and pane-height pages', () => {
    expect(wheelPanDelta({ deltaX: 30, deltaY: 40, deltaMode: 0, ctrlKey: false }, 500)).toEqual({ x: -30, y: -40 });
    expect(wheelPanDelta({ deltaX: 0, deltaY: 2, deltaMode: 1, ctrlKey: false }, 500)).toEqual({ x: -0, y: -32 });
    expect(wheelPanDelta({ deltaX: 1, deltaY: 0, deltaMode: 2, ctrlKey: false }, 500)).toEqual({ x: -500, y: -0 });
  });
});

describe('zoom interpolation', () => {
  it('eases in and out cubically', () => {
    const values = [
      [0, 0],
      [0.1, 0.004],
      [0.25, 0.0625],
      [0.5, 0.5],
      [0.75, 0.9375],
      [0.9, 0.996],
      [1, 1],
    ];
    for (const [t, expected] of values) expect(easeCubicInOut(t)).toBeCloseTo(expected, 9);
  });

  it('follows the d3 zoom transition between two viewports', () => {
    for (const { from, to, anchor, size, frames } of D3_TRANSITIONS) {
      const interpolate = interpolateViewport(from, to, anchor, size);
      for (const frame of frames) {
        const state = interpolate(frame.t);
        expect(state.x).withContext(`x at ${frame.t}`).toBeCloseTo(frame.x, 6);
        expect(state.y).withContext(`y at ${frame.t}`).toBeCloseTo(frame.y, 6);
        expect(state.zoom).withContext(`zoom at ${frame.t}`).toBeCloseTo(frame.zoom, 9);
      }
    }
  });

  it('ends exactly on the target', () => {
    const to = { x: -100.123, y: 7.5, zoom: 2.25 };
    expect(interpolateViewport({ x: 0, y: 0, zoom: 1 }, to, { x: 50, y: 50 }, 100)(1)).toBe(to);
  });
});
