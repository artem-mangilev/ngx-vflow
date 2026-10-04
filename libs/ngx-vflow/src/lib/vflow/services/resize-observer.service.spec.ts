import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ResizeObserverService } from './resize-observer.service';

describe('ResizeObserverService', () => {
  let nativeCallback: ResizeObserverCallback;
  let nativeObserver: { observe: Mock; unobserve: Mock; disconnect: Mock };
  let originalResizeObserver: typeof ResizeObserver;

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

    TestBed.configureTestingModule({
      providers: [ResizeObserverService],
    });
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  it('should observe each element once and retain independent subscribers', () => {
    const service = TestBed.inject(ResizeObserverService);
    const element = document.createElement('div');
    const first = vi.fn();
    const second = vi.fn();
    const entry = { target: element } as unknown as ResizeObserverEntry;

    service.addObserver(element, first);
    service.addObserver(element, second);

    expect(nativeObserver.observe).toHaveBeenCalledExactlyOnceWith(element);

    nativeCallback([entry], nativeObserver);

    expect(first).toHaveBeenCalledExactlyOnceWith(entry);
    expect(second).toHaveBeenCalledExactlyOnceWith(entry);

    service.removeObserver(element, first);
    nativeCallback([entry], nativeObserver);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    expect(nativeObserver.unobserve).not.toHaveBeenCalled();

    service.removeObserver(element, second);

    expect(nativeObserver.unobserve).toHaveBeenCalledExactlyOnceWith(element);
  });
});
