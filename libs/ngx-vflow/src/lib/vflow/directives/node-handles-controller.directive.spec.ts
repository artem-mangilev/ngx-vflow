import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { AfterRenderBatchService } from '../services/after-render-batch.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewportService } from '../services/viewport.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { NodeHandlesControllerDirective } from './node-handles-controller.directive';

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
  let handles: ReturnType<typeof signal<HandleModel[]>>;
  let reads: Array<() => void>;
  let observerCallbacks: Array<{ element: Element; callback: (entry: ResizeObserverEntry) => void }>;

  beforeEach(() => {
    handles = signal<HandleModel[]>([]);
    reads = [];
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
      handles,
      nodeElement: () => nodeElement,
    } as unknown as NodeModel;
    const resizeObserver = {
      addObserver: (element: Element, callback: (entry: ResizeObserverEntry) => void) => {
        observerCallbacks.push({ element, callback });
      },
      removeObserver: vi.fn(),
    };
    // Like the service, one read per callback until it runs.
    const afterRender = {
      read: (callback: () => void) => {
        if (!reads.includes(callback)) reads.push(callback);
      },
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: ResizeObserverService, useValue: resizeObserver },
        { provide: AfterRenderBatchService, useValue: afterRender },
        { provide: ViewportService, useValue: { readableViewport: () => ({ zoom: 1, x: 0, y: 0 }) } },
        { provide: FlowRenderingService, useValue: { viewport: () => null } },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.model = model;
    fixture.detectChanges();
  });

  function flushReads() {
    reads.splice(0).forEach((read) => read());
  }

  it('should coalesce node measurement and observe a shared anchor once', () => {
    const anchor = document.createElement('div');
    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');
    const executionOrder: string[] = [];
    const boxes = { handle: { left: 0, top: 0, width: 10, height: 10 }, anchor: null, origin: null };
    anchor.append(firstElement, secondElement);
    const first = { measure: vi.fn(), applyMeasurement: vi.fn(), element: firstElement };
    const second = { measure: vi.fn(), applyMeasurement: vi.fn(), element: secondElement };
    first.measure.mockImplementation(() => {
      executionOrder.push('measure first');
      return boxes;
    });
    second.measure.mockImplementation(() => {
      executionOrder.push('measure second');
      return boxes;
    });
    first.applyMeasurement.mockImplementation(() => executionOrder.push('apply first'));
    second.applyMeasurement.mockImplementation(() => executionOrder.push('apply second'));

    handles.set([first, second] as unknown as HandleModel[]);
    fixture.detectChanges();

    observerCallbacks.forEach(({ element, callback }) =>
      callback({ target: element } as unknown as ResizeObserverEntry),
    );

    expect(reads.length).toBe(1);
    expect(observerCallbacks.filter(({ element }) => element === anchor).length).toBe(1);

    flushReads();

    expect(first.measure).toHaveBeenCalledTimes(1);
    expect(second.measure).toHaveBeenCalledTimes(1);
    expect(first.applyMeasurement).toHaveBeenCalledExactlyOnceWith(boxes);
    expect(second.applyMeasurement).toHaveBeenCalledExactlyOnceWith(boxes);
    expect(executionOrder).toEqual(['measure first', 'measure second', 'apply first', 'apply second']);
  });

  it('should measure handles again when node content moves without resizing', async () => {
    const host: HTMLElement = fixture.nativeElement.querySelector('[nodeHandlesController]');
    const rows = [document.createElement('div'), document.createElement('div')];
    host.append(...rows);
    const handle = { measure: vi.fn().mockReturnValue(null), applyMeasurement: vi.fn(), element: rows[0] };
    handles.set([handle] as unknown as HandleModel[]);
    fixture.detectChanges();
    flushReads();
    handle.measure.mockClear();

    // A reorder, as a keyed @for performs it: the same elements, a new order, no size change.
    host.insertBefore(rows[1], rows[0]);
    await Promise.resolve();

    expect(reads.length).toBe(1);
    flushReads();
    expect(handle.measure).toHaveBeenCalledTimes(1);
  });
});
