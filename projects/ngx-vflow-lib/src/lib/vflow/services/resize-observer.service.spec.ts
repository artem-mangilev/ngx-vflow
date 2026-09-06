import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResizeObserverService } from './resize-observer.service';

describe('ResizeObserverService', () => {
  let nativeCallback: ResizeObserverCallback;
  let nativeObserver: jasmine.SpyObj<ResizeObserver>;
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    nativeObserver = jasmine.createSpyObj<ResizeObserver>('ResizeObserver', ['observe', 'unobserve', 'disconnect']);

    window.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        nativeCallback = callback;
      }

      observe = nativeObserver.observe;
      unobserve = nativeObserver.unobserve;
      disconnect = nativeObserver.disconnect;
    } as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({
      providers: [ResizeObserverService, provideExperimentalZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  it('should observe each element once and retain independent subscribers', () => {
    const service = TestBed.inject(ResizeObserverService);
    const element = document.createElement('div');
    const first = jasmine.createSpy('first subscriber');
    const second = jasmine.createSpy('second subscriber');
    const entry = { target: element } as unknown as ResizeObserverEntry;

    service.addObserver(element, first);
    service.addObserver(element, second);

    expect(nativeObserver.observe).toHaveBeenCalledOnceWith(element);

    nativeCallback([entry], nativeObserver);

    expect(first).toHaveBeenCalledOnceWith(entry);
    expect(second).toHaveBeenCalledOnceWith(entry);

    service.removeObserver(element, first);
    nativeCallback([entry], nativeObserver);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    expect(nativeObserver.unobserve).not.toHaveBeenCalled();

    service.removeObserver(element, second);

    expect(nativeObserver.unobserve).toHaveBeenCalledOnceWith(element);
  });
});
