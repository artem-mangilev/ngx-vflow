import { ChangeDetectionStrategy, Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { NodeAccessorService } from '../services/node-accessor.service';
import { RequestAnimationFrameBatchingService } from '../services/request-animation-frame-batching.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { NodeHandlesControllerDirective } from './node-handles-controller.directive';

@Component({
  template: '<div nodeHandlesController></div>',
  imports: [NodeHandlesControllerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

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
    nodeElement.getBoundingClientRect = jasmine
      .createSpy('node rect')
      .and.returnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);

    const model = {
      handles$,
      handles: () => handles,
      nodeElement: () => nodeElement,
    } as unknown as NodeModel;
    const nodeAccessor = { model: () => model };
    const resizeObserver = {
      addObserver: (element: Element, callback: (entry: ResizeObserverEntry) => void) => {
        observerCallbacks.push({ element, callback });
      },
      removeObserver: jasmine.createSpy('removeObserver'),
    };
    const animationFrames = {
      batchAnimationFrame: (callback: () => void) => frameCallbacks.push(callback),
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: NodeAccessorService, useValue: nodeAccessor },
        { provide: ResizeObserverService, useValue: resizeObserver },
        { provide: RequestAnimationFrameBatchingService, useValue: animationFrames },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
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
    const first = jasmine.createSpyObj<HandleModel>('first handle', ['measure', 'applyGeometry'], {
      hostReference: anchor,
      handleElement: firstElement,
      isStandard: false,
    });
    const second = jasmine.createSpyObj<HandleModel>('second handle', ['measure', 'applyGeometry'], {
      hostReference: anchor,
      handleElement: secondElement,
      isStandard: false,
    });
    first.measure.and.callFake(() => {
      executionOrder.push('measure first');
      return geometry;
    });
    second.measure.and.callFake(() => {
      executionOrder.push('measure second');
      return geometry;
    });
    first.applyGeometry.and.callFake(() => executionOrder.push('apply first'));
    second.applyGeometry.and.callFake(() => executionOrder.push('apply second'));

    handles = [first, second];
    handles$.next(handles);

    observerCallbacks.forEach(({ element, callback }) =>
      callback({ target: element } as unknown as ResizeObserverEntry),
    );

    expect(frameCallbacks.length).toBe(1);
    expect(observerCallbacks.filter(({ element }) => element === anchor).length).toBe(1);

    frameCallbacks[0]();

    expect(first.measure).toHaveBeenCalledTimes(1);
    expect(second.measure).toHaveBeenCalledTimes(1);
    expect(first.applyGeometry).toHaveBeenCalledOnceWith(geometry);
    expect(second.applyGeometry).toHaveBeenCalledOnceWith(geometry);
    expect(executionOrder).toEqual(['measure first', 'measure second', 'apply first', 'apply second']);
  });
});
