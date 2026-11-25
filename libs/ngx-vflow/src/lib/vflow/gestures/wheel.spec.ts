import { wheelPanDelta, wheelZoomFactor } from './wheel';

describe('wheel', () => {
  it.each([
    ['a pixel delta up', { deltaY: -100, deltaMode: 0, ctrlKey: false }, 1.148698355],
    ['a pixel delta down', { deltaY: 100, deltaMode: 0, ctrlKey: false }, 0.870550563],
    ['a line delta', { deltaY: -3, deltaMode: 1, ctrlKey: false }, 1.109569472],
    ['a page delta', { deltaY: 1, deltaMode: 2, ctrlKey: false }, 0.5],
    ['a pinch on a trackpad, with ctrl', { deltaY: -10, deltaMode: 0, ctrlKey: true }, 1.148698355],
  ])('matches the d3 wheel zoom factor for %s', (_, event, factor) => {
    expect(wheelZoomFactor({ deltaX: 0, ...event })).toBeCloseTo(factor, 9);
  });

  it.each([
    ['pixels', { deltaX: 30, deltaY: 40, deltaMode: 0 }, { x: -30, y: -40 }],
    ['16-pixel lines', { deltaX: 0, deltaY: 2, deltaMode: 1 }, { x: -0, y: -32 }],
    ['pane-height pages', { deltaX: 1, deltaY: 0, deltaMode: 2 }, { x: -500, y: -0 }],
  ])('scroll-pans by %s', (_, event, delta) => {
    expect(wheelPanDelta({ ...event, ctrlKey: false }, 500)).toEqual(delta);
  });
});
