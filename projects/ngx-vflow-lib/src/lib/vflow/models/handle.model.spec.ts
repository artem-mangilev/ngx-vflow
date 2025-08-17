import { TestBed } from '@angular/core/testing';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';
import { NodeModel } from './node.model';

describe('HandleModel', () => {
  const nodeWidth = 10;
  const nodeHeight = 10;

  let model: HandleModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService],
    });

    // we assume that host element has same size as whole node, it's actually true for default node
    const hostReference = document.createElement('div');
    spyOnProperty(hostReference, 'offsetWidth').and.returnValue(nodeWidth);
    spyOnProperty(hostReference, 'offsetHeight').and.returnValue(nodeHeight);

    model = TestBed.runInInjectionContext(
      () =>
        new HandleModel(
          {
            type: 'source',
            position: 'right',
            hostReference: hostReference,
            userOffsetX: 0,
            userOffsetY: 0,
          },
          new NodeModel({
            id: '1',
            type: 'default',
            text: 'test',
            point: { x: 15, y: 15 },
          }),
        ),
    );

    model.updateHost();
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  it('should provide its absolute point', () => {
    model.size.set({ width: 0, height: 0 });
    model.parentNode.width.set(nodeWidth);
    model.parentNode.height.set(nodeHeight);

    expect(model.pointAbsolute()).toEqual({ x: 25, y: 20 });
  });

  it('should provide offset relative to host element', () => {
    model.size.set({ width: 0, height: 0 });
    model.parentNode.width.set(nodeWidth);
    model.parentNode.height.set(nodeHeight);

    expect(model.hostOffset()).toEqual({ x: 10, y: 5 });
  });
});
