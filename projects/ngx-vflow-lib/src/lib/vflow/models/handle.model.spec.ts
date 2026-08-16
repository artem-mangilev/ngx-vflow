import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';

function mockRect(element: Element, rect: { left: number; top: number; width: number; height: number }): void {
  const { left, top, width, height } = rect;

  element.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe('HandleModel', () => {
  let viewportService: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    viewportService = TestBed.inject(ViewportService);
    viewportService.readableViewport.set({ zoom: 1, x: 0, y: 0 });
  });

  function createModel(
    position: 'left' | 'right' | 'top' | 'bottom',
    anchorRect: { left: number; top: number; width: number; height: number },
    nodeType: 'default' | 'html-template' = 'default',
  ) {
    const anchor = document.createElement('div');
    const nodeElement = document.createElement('div');
    const handleElement = document.createElement('div');

    mockRect(anchor, anchorRect);
    mockRect(nodeElement, { left: 0, top: 0, width: 100, height: 100 });

    const parentNode = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: '1',
            type: nodeType,
            point: { x: 0, y: 0 },
          }),
        ),
    );

    parentNode.nodeElement.set(nodeElement);

    const model = TestBed.runInInjectionContext(
      () =>
        new HandleModel(
          {
            type: 'source',
            position,
            hostReference: anchor,
            userOffsetX: 0,
            userOffsetY: 0,
          },
          parentNode,
        ),
    );

    model.handleElement = handleElement;

    return { model, parentNode, nodeElement, handleElement, anchor };
  }

  it('should create', () => {
    const { model } = createModel('right', { left: 10, top: 30, width: 80, height: 20 });

    expect(model).toBeTruthy();
  });

  it('should derive a standard handle from node dimensions without measuring DOM geometry', () => {
    const { model, parentNode, anchor, nodeElement, handleElement } = createModel('right', {
      left: 10,
      top: 30,
      width: 80,
      height: 20,
    });

    anchor.getBoundingClientRect = jasmine.createSpy('anchor rect').and.throwError('unexpected anchor measurement');
    nodeElement.getBoundingClientRect = jasmine.createSpy('node rect').and.throwError('unexpected node measurement');
    handleElement.getBoundingClientRect = jasmine
      .createSpy('handle rect')
      .and.throwError('unexpected handle measurement');

    model.sync();

    expect(model.layoutStyles()).toEqual({
      top: '25px',
      left: 'auto',
      right: '0',
      bottom: 'auto',
    });
    expect(model.pointAbsolute()).toEqual({ x: 107, y: 25 });

    parentNode.height.set(160);
    model.sync();

    expect(model.layoutStyles().top).toBe('80px');
    expect(model.pointAbsolute()).toEqual({ x: 107, y: 80 });
  });

  it('should keep a custom handle aligned with its anchor after node resize', () => {
    const { model, parentNode, anchor, nodeElement, handleElement } = createModel(
      'right',
      { left: 10, top: 30, width: 80, height: 20 },
      'html-template',
    );

    mockRect(handleElement, { left: 90, top: 35, width: 20, height: 10 });

    model.sync();

    expect(model.layoutStyles().top).toBe('40px');
    expect(model.pointAbsolute()).toEqual({ x: 110, y: 40 });

    viewportService.readableViewport.set({ zoom: 2, x: 0, y: 0 });
    parentNode.width.set(160);
    parentNode.height.set(160);
    mockRect(nodeElement, { left: 0, top: 0, width: 320, height: 320 });
    mockRect(anchor, { left: 20, top: 140, width: 280, height: 40 });
    mockRect(handleElement, { left: 300, top: 150, width: 40, height: 20 });

    model.sync();

    expect(model.layoutStyles().top).toBe('80px');
    expect(model.pointAbsolute()).toEqual({ x: 170, y: 80 });
  });

  it('should expose connectability in the custom handle template context', () => {
    const { parentNode, anchor } = createModel('right', { left: 10, top: 30, width: 80, height: 20 });
    const canStart = signal(false);
    const canAccept = signal(true);
    const model = TestBed.runInInjectionContext(
      () =>
        new HandleModel(
          {
            type: 'source',
            position: 'right',
            hostReference: anchor,
            userOffsetX: 0,
            userOffsetY: 0,
            canStart,
            canAccept,
          },
          parentNode,
        ),
    );

    expect(model.templateContext.$implicit.canStart()).toBeFalse();
    expect(model.templateContext.$implicit.canAccept()).toBeTrue();

    canStart.set(true);
    canAccept.set(false);

    expect(model.templateContext.$implicit.canStart()).toBeTrue();
    expect(model.templateContext.$implicit.canAccept()).toBeFalse();
  });
});
