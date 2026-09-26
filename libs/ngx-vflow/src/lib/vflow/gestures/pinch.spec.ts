import { touchCenter, touchViewport } from './pinch';

describe('touch viewport', () => {
  const options = { pan: true, zoom: true, minZoom: 0.5, maxZoom: 3 };
  const current = { x: 0, y: 0, zoom: 1 };

  it('keeps the flow point of one touch under the finger', () => {
    const next = touchViewport(
      current,
      [{ pane: { x: 130, y: 90 }, flow: { x: 100, y: 100 } }],
      { x: 0, y: 0 },
      options,
    );
    expect(next).toEqual({ x: 30, y: -10, zoom: 1 });
  });

  it('matches d3: the zoom is the ratio of pane to flow distance around the middle of the flow points', () => {
    const touches = [
      { pane: { x: 50, y: 100 }, flow: { x: 100, y: 100 } },
      { pane: { x: 250, y: 100 }, flow: { x: 200, y: 100 } },
    ];
    expect(touchViewport(current, touches, touchCenter(touches), options)).toEqual({ x: -150, y: -100, zoom: 2 });
    expect(touchViewport(current, touches, touchCenter(touches), { ...options, maxZoom: 1.5 }).zoom).toBe(1.5);
  });

  it('pans without zooming when pinch zoom is disabled', () => {
    const touches = [
      { pane: { x: 90, y: 100 }, flow: { x: 100, y: 100 } },
      { pane: { x: 230, y: 100 }, flow: { x: 200, y: 100 } },
    ];
    expect(touchViewport(current, touches, { x: 150, y: 100 }, { ...options, zoom: false })).toEqual({
      x: 10,
      y: 0,
      zoom: 1,
    });
  });

  it('zooms around the pinch center without following the fingers when panning is disabled', () => {
    const touches = [
      { pane: { x: 90, y: 100 }, flow: { x: 100, y: 100 } },
      { pane: { x: 230, y: 100 }, flow: { x: 200, y: 100 } },
    ];
    const next = touchViewport(current, touches, { x: 150, y: 100 }, { ...options, pan: false });
    expect(next.zoom).toBeCloseTo(1.4);
    expect(next.x).toBeCloseTo(-60);
    expect(next.y).toBeCloseTo(-40);
    // One finger alone cannot change a viewport that must not pan.
    expect(touchViewport(current, [touches[0]], { x: 0, y: 0 }, { ...options, pan: false })).toEqual(current);
  });
});
