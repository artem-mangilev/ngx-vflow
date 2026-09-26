import { animateViewport } from './viewport-animation';
import { interpolateViewport } from './zoom-interpolation';
import { ViewportState } from '../interfaces/viewport.interface';

describe('animateViewport', () => {
  let now: number;
  let frames: Map<number, FrameRequestCallback>;
  let nextId: number;

  beforeEach(() => {
    now = 1000;
    frames = new Map();
    nextId = 0;
    spyOn(performance, 'now').and.callFake(() => now);
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      frames.set(++nextId, callback);
      return nextId;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((id) => frames.delete(id));
  });

  function frame(ms: number) {
    now += ms;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
  }

  function run(duration: number, current: () => ViewportState, events: string[], states: ViewportState[]) {
    return animateViewport({
      duration,
      current,
      target: () => ({ x: 100, y: 0, zoom: 1 }),
      anchor: () => ({ x: 50, y: 50 }),
      size: () => 100,
      onStart: () => events.push('start'),
      onFrame: (state) => states.push(state),
      onEnd: () => events.push('end'),
    });
  }

  it('times the animation from the request and reads its start on the first frame', () => {
    const events: string[] = [];
    const states: ViewportState[] = [];
    let current = { x: 0, y: 0, zoom: 1 };
    run(100, () => current, events, states);
    current = { x: 20, y: 0, zoom: 1 };
    frame(50);
    expect(events).toEqual(['start']);
    // Half the duration with cubic in-out easing is half the way from where the viewport was on the first frame.
    expect(states[0]).toEqual(
      interpolateViewport({ x: 20, y: 0, zoom: 1 }, { x: 100, y: 0, zoom: 1 }, { x: 50, y: 50 }, 100)(0.5),
    );
    frame(60);
    expect(states.at(-1)).toEqual({ x: 100, y: 0, zoom: 1 });
    expect(events).toEqual(['start', 'end']);
    expect(frames.size).toBe(0);
  });

  it('ends an interrupted animation once and cancels one that did not start silently', () => {
    const events: string[] = [];
    const animation = run(100, () => ({ x: 0, y: 0, zoom: 1 }), events, []);
    frame(10);
    animation.interrupt();
    animation.interrupt();
    expect(events).toEqual(['start', 'end']);
    const pending: string[] = [];
    run(100, () => ({ x: 0, y: 0, zoom: 1 }), pending, []).interrupt();
    frame(10);
    expect(pending).toEqual([]);
  });
});
