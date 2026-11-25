import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ResizeObserverService } from './resize-observer.service';

describe('ResizeObserverService', () => {
  let nativeCallback: ResizeObserverCallback;
  let nativeObserver: { observe: Mock; unobserve: Mock; disconnect: Mock };
  let originalResizeObserver: typeof ResizeObserver;
  let service: ResizeObserverService;
  let element: HTMLElement;
  let entry: ResizeObserverEntry;

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    nativeObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };

    window.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        nativeCallback = callback;
      }

      observe = nativeObserver.observe;
      unobserve = nativeObserver.unobserve;
      disconnect = nativeObserver.disconnect;
    } as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({ providers: [ResizeObserverService] });
    service = TestBed.inject(ResizeObserverService);
    element = document.createElement('div');
    entry = { target: element } as unknown as ResizeObserverEntry;
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  const resize = () => nativeCallback([entry], nativeObserver as unknown as ResizeObserver);

  it('observes an element once for any number of subscribers', () => {
    service.addObserver(element, vi.fn());
    service.addObserver(element, vi.fn());

    expect(nativeObserver.observe).toHaveBeenCalledExactlyOnceWith(element);
  });

  it('gives a resize of the element to every subscriber', () => {
    const first = vi.fn();
    const second = vi.fn();
    service.addObserver(element, first);
    service.addObserver(element, second);

    resize();

    expect(first).toHaveBeenCalledExactlyOnceWith(entry);
    expect(second).toHaveBeenCalledExactlyOnceWith(entry);
  });

  it('stops calling a removed subscriber and keeps observing for the others', () => {
    const first = vi.fn();
    const second = vi.fn();
    service.addObserver(element, first);
    service.addObserver(element, second);

    service.removeObserver(element, first);
    resize();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(nativeObserver.unobserve).not.toHaveBeenCalled();
  });

  it('stops observing the element once its last subscriber is removed', () => {
    const callback = vi.fn();
    service.addObserver(element, callback);

    service.removeObserver(element, callback);

    expect(nativeObserver.unobserve).toHaveBeenCalledExactlyOnceWith(element);
  });
});
