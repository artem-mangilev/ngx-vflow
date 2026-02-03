import { TestBed } from '@angular/core/testing';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { ToolbarModel } from './toolbar.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ToolbarModel', () => {
  let model: ToolbarModel;

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

    model = TestBed.runInInjectionContext(
      () =>
        new ToolbarModel(
          new NodeModel(
            createNode({
              id: '1',
              type: 'default',
              text: 'test',
              point: { x: 15, y: 15 },
            }),
          ),
        ),
    );
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  it('should provide correct point for top position', () => {
    model.position.set('top');
    model.size.set({ width: 10, height: 10 });
    model.offset.set(10);

    model.node.width.set(100);
    model.node.height.set(100);

    expect(model.point()).toEqual({ x: 45, y: -20 });
  });

  it('should provide correct point for bottom position', () => {
    model.position.set('bottom');
    model.size.set({ width: 10, height: 10 });
    model.offset.set(10);

    model.node.width.set(100);
    model.node.height.set(100);

    expect(model.point()).toEqual({ x: 45, y: 110 });
  });

  it('should provide correct point for left position', () => {
    model.position.set('left');
    model.size.set({ width: 10, height: 10 });
    model.offset.set(10);

    model.node.width.set(100);
    model.node.height.set(100);

    expect(model.point()).toEqual({ x: -20, y: 45 });
  });

  it('should provide correct point for right position', () => {
    model.position.set('right');
    model.size.set({ width: 10, height: 10 });
    model.offset.set(10);

    model.node.width.set(100);
    model.node.height.set(100);

    expect(model.point()).toEqual({ x: 110, y: 45 });
  });
});
