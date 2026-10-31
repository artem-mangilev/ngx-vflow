import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewportService } from '../services/viewport.service';
import { NodeHandlesControllerDirective } from './node-handles-controller.directive';
import { Position } from '../types/position.type';
import { HandleLayout } from '../types/handle-type.type';

@Component({
  template: '<div nodeHandlesController [model]="model"></div>',
  imports: [NodeHandlesControllerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  model!: NodeModel;
}

describe('NodeHandlesControllerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let handles$: BehaviorSubject<HandleModel[]>;
  let handles: HandleModel[];
  let frameCallbacks: Array<() => void>;
  let observerCallbacks: Array<{ element: Element; callback: (entry: ResizeObserverEntry) => void }>;

  beforeEach(() => {
    handles$ = new BehaviorSubject<HandleModel[]>([]);
    handles = [];
    frameCallbacks = [];
    observerCallbacks = [];

    const nodeElement = document.createElement('div');
    nodeElement.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);

    const model = {
      culled: () => false,
      width: () => 100,
      height: () => 50,
      rawNode: {},
      handles$,
      handles: () => handles,
      nodeElement: () => nodeElement,
    } as unknown as NodeModel;
    const resizeObserver = {
      addObserver: (element: Element, callback: (entry: ResizeObserverEntry) => void) => {
        observerCallbacks.push({ element, callback });
      },
      removeObserver: vi.fn(),
    };
    const animationFrames = {
      batchAnimationFrame: (callback: () => void) => frameCallbacks.push(callback),
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: ResizeObserverService, useValue: resizeObserver },
        { provide: RequestAnimationFrameBatchingService, useValue: animationFrames },
        { provide: ViewportService, useValue: { readableViewport: () => ({ zoom: 1, x: 0, y: 0 }) } },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.model = model;
    fixture.detectChanges();
  });

  it('should coalesce node measurement and observe a shared anchor once', () => {
    const anchor = document.createElement('div');
    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');
    const executionOrder: string[] = [];
    const geometry = {
      layoutStyles: { top: '0', left: '0', right: 'auto', bottom: 'auto' },
      localPoint: { x: 0, y: 0 },
    };
    anchor.append(firstElement, secondElement);
    const handleSignals = {
      position: signal<Position>('right'),
      offsetX: signal(0),
      offsetY: signal(0),
      layout: signal<HandleLayout>('auto'),
    };
    const first = { measure: vi.fn(), applyGeometry: vi.fn(), element: firstElement, ...handleSignals };
    const second = { measure: vi.fn(), applyGeometry: vi.fn(), element: secondElement, ...handleSignals };
    first.measure.mockImplementation(() => {
      executionOrder.push('measure first');
      return geometry;
    });
    second.measure.mockImplementation(() => {
      executionOrder.push('measure second');
      return geometry;
    });
    first.applyGeometry.mockImplementation(() => executionOrder.push('apply first'));
    second.applyGeometry.mockImplementation(() => executionOrder.push('apply second'));

    handles = [first, second] as unknown as HandleModel[];
    handles$.next(handles);

    observerCallbacks.forEach(({ element, callback }) =>
      callback({ target: element } as unknown as ResizeObserverEntry),
    );

    expect(frameCallbacks.length).toBe(1);
    expect(observerCallbacks.filter(({ element }) => element === anchor).length).toBe(1);

    frameCallbacks[0]();

    expect(first.measure).toHaveBeenCalledTimes(1);
    expect(second.measure).toHaveBeenCalledTimes(1);
    expect(first.applyGeometry).toHaveBeenCalledExactlyOnceWith(geometry);
    expect(second.applyGeometry).toHaveBeenCalledExactlyOnceWith(geometry);
    expect(executionOrder).toEqual(['measure first', 'measure second', 'apply first', 'apply second']);
  });

  it('should measure handles again when node content moves without resizing', async () => {
    const host: HTMLElement = fixture.nativeElement.querySelector('[nodeHandlesController]');
    const rows = [document.createElement('div'), document.createElement('div')];
    host.append(...rows);
    const handle = {
      measure: vi.fn().mockReturnValue(null),
      applyGeometry: vi.fn(),
      element: rows[0],
      position: signal<Position>('left'),
      offsetX: signal(0),
      offsetY: signal(0),
      layout: signal<HandleLayout>('auto'),
    };
    handles = [handle] as unknown as HandleModel[];
    handles$.next(handles);
    frameCallbacks.splice(0).forEach((callback) => callback());
    handle.measure.mockClear();

    // A reorder, as a keyed @for performs it: the same elements, a new order, no size change.
    host.insertBefore(rows[1], rows[0]);
    await Promise.resolve();

    expect(frameCallbacks.length).toBe(1);
    frameCallbacks[0]();
    expect(handle.measure).toHaveBeenCalledTimes(1);
  });
});
