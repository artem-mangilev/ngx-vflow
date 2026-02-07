import { TestBed } from '@angular/core/testing';
import { EdgeModel } from './edge.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { createEdge } from '../interfaces/edge.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HtmlElementCacheService } from '../services/html-element-cache.service';
import { SvgGraphicElementCacheService } from '../services/svg-graphic-element-cache.service';

describe('EdgeModel', () => {
  let model: EdgeModel;
  let htmlElementCacheService: HtmlElementCacheService;
  let svgGraphicElementCacheService: SvgGraphicElementCacheService;

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

    htmlElementCacheService = new HtmlElementCacheService();
    svgGraphicElementCacheService = new SvgGraphicElementCacheService();

    model = TestBed.runInInjectionContext(
      () =>
        new EdgeModel(
          createEdge({
            id: '1 -> 2',
            source: '1',
            target: '2',
            curve: 'straight',
          }),
        ),
    );

    model.source.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '1',
              type: 'default',
              text: 'test',
              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );
    model.target.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '2',
              type: 'default',
              text: 'test',
              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );

    model.source()!.handles.set([
      TestBed.runInInjectionContext(
        () =>
          new HandleModel(
            {
              type: 'source',
              position: 'right',
              userOffsetX: 0,
              userOffsetY: 0,
            },
            model.source()!,
            htmlElementCacheService,
            svgGraphicElementCacheService,
          ),
      ),
    ]);

    model.target()!.handles.set([
      TestBed.runInInjectionContext(
        () =>
          new HandleModel(
            {
              type: 'target',
              position: 'left',
              userOffsetX: 0,
              userOffsetY: 0,
            },
            model.source()!,
            htmlElementCacheService,
            svgGraphicElementCacheService,
          ),
      ),
    ]);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  /**
   * @todo add more path tests
   */
  it('should provide path', () => {
    model.source()?.handles()[0].size.set({ width: 1, height: 1 });
    model.target()?.handles()[0].size.set({ width: 1, height: 1 });

    expect(model.path().path).toBe('M 15.5,15L 14.5,15');
  });

  it('should set detached === true if there no source', () => {
    model.source.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target', () => {
    model.target.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no source handle', () => {
    model.source()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target handle', () => {
    model.target()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === false if source and target exists and their source and target handle also exists', () => {
    expect(model.detached()).toEqual(false);
  });
});
