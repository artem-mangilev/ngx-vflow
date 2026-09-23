import { TestBed } from '@angular/core/testing';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { ToolbarModel } from './toolbar.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ToolbarModel', () => {
  let model: ToolbarModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        provideZonelessChangeDetection(),
      ],
    });

    model = TestBed.runInInjectionContext(
      () =>
        new ToolbarModel(
          new NodeModel(
            createNode({
              id: '1',

              point: { x: 15, y: 15 },
            }),
          ),
        ),
    );

    model.offset.set(10);
    model.node.width.set(100);
    model.node.height.set(100);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  it('should attach above the node for top position', () => {
    model.position.set('top');

    expect(model.anchor()).toEqual({ x: 50, y: -10 });
    expect(model.shift()).toEqual({ x: -50, y: -100 });
  });

  it('should attach below the node for bottom position', () => {
    model.position.set('bottom');

    expect(model.anchor()).toEqual({ x: 50, y: 110 });
    expect(model.shift()).toEqual({ x: -50, y: 0 });
  });

  it('should attach to the left of the node for left position', () => {
    model.position.set('left');

    expect(model.anchor()).toEqual({ x: -10, y: 50 });
    expect(model.shift()).toEqual({ x: -100, y: -50 });
  });

  it('should attach to the right of the node for right position', () => {
    model.position.set('right');

    expect(model.anchor()).toEqual({ x: 110, y: 50 });
    expect(model.shift()).toEqual({ x: 0, y: -50 });
  });

  it('should position the host from the node point without knowing the toolbar size', () => {
    model.position.set('top');

    expect(model.transform()).toBe('translate(65px, 5px) translate(-50%, -100%)');

    model.node.point.set({ x: 100, y: 200 });

    expect(model.transform()).toBe('translate(150px, 190px) translate(-50%, -100%)');
  });
});
