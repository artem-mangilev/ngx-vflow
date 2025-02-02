import { TestBed } from '@angular/core/testing';
import { EdgeModel } from './edge.model';
import { NodeModel } from './node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';

describe('EdgeModel', () => {
  let model: EdgeModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService],
    });

    model = TestBed.runInInjectionContext(
      () =>
        new EdgeModel({
          id: '1 -> 2',
          source: '1',
          target: '2',
          curve: 'straight',
        }),
    );

    model.source.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel({
            id: '1',
            type: 'default',
            text: 'test',
            point: { x: 15, y: 15 },
          }),
      ),
    );
    model.target.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel({
            id: '2',
            type: 'default',
            text: 'test',
            point: { x: 15, y: 15 },
          }),
      ),
    );

    model.source()!.handles.set([
      TestBed.runInInjectionContext(
        () =>
          new HandleModel(
            {
              type: 'source',
              position: 'right',
            },
            model.source()!,
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
            },
            model.source()!,
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
