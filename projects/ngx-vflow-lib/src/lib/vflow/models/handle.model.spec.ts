import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
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
            type: 'default',
            text: 'test',
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

    return { model, nodeElement, handleElement, anchor };
  }

  it('should create', () => {
    const { model } = createModel('right', { left: 10, top: 30, width: 80, height: 20 });

    expect(model).toBeTruthy();
  });

  it('should place a right handle on the node boundary at the anchor center', () => {
    const { model } = createModel('right', { left: 10, top: 30, width: 80, height: 20 });

    model.updateHost();

    expect(model.layoutStyles()).toEqual({
      top: '40px',
      left: 'auto',
      right: '0',
      bottom: 'auto',
    });
  });

  it('should place a left handle on the node boundary at the anchor center', () => {
    const { model } = createModel('left', { left: 10, top: 10, width: 80, height: 20 });

    model.updateHost();

    expect(model.layoutStyles()).toEqual({
      top: '20px',
      left: '0',
      right: 'auto',
      bottom: 'auto',
    });
  });

  it('should place a top handle on the node boundary at the anchor center', () => {
    const { model } = createModel('top', { left: 20, top: 10, width: 30, height: 20 });

    model.updateHost();

    expect(model.layoutStyles()).toEqual({
      top: '0',
      left: '35px',
      right: 'auto',
      bottom: 'auto',
    });
  });

  it('should account for viewport zoom when computing layout', () => {
    viewportService.readableViewport.set({ zoom: 2, x: 0, y: 0 });

    const { model } = createModel('right', { left: 20, top: 60, width: 160, height: 40 });

    model.updateHost();

    expect(model.layoutStyles().top).toBe('40px');
  });

  it('should measure the connection point from the rendered handle', () => {
    const { model, handleElement, nodeElement } = createModel('right', {
      left: 10,
      top: 30,
      width: 80,
      height: 20,
    });

    mockRect(handleElement, { left: 86, top: 33, width: 14, height: 14 });

    model.updateHost();

    expect(model.pointAbsolute()).toEqual({ x: 100, y: 40 });
    expect(nodeElement).toBeTruthy();
  });
});
