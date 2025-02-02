import { TestBed } from '@angular/core/testing';
import { NodeModel } from './node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';

describe('NodeModel', () => {
  let model: NodeModel;
  let entitiesService: FlowEntitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService],
    });

    model = TestBed.runInInjectionContext(
      () =>
        new NodeModel({
          id: '1',
          type: 'default',
          text: 'test',
          point: { x: 15, y: 15 },
        }),
    );

    entitiesService = TestBed.inject(FlowEntitiesService);

    entitiesService.nodes.update((nodes) => [...nodes, model]);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  it('should set/get point', () => {
    model.setPoint({ x: 10, y: 10 });
    expect(model.point()).toEqual({ x: 10, y: 10 });
  });

  it('should create correct translate function from point', () => {
    model.setPoint({ x: 10, y: 10 });
    expect(model.pointTransform()).toEqual('translate(10, 10)');
  });

  it('should create correct parent/children links', () => {
    const childModel = () =>
      new NodeModel({
        id: '2',
        parentId: '1',
        type: 'default',
        point: { x: 10, y: 10 },
      });

    entitiesService.nodes.update((nodes) => [...nodes, TestBed.runInInjectionContext(childModel)]);

    expect(model.children().length).toEqual(1);
    // check if children of model is correct
    expect(model.children()[0].node.id).toEqual('2');
    // check if parent of child is also set correctly
    expect(model.children()[0].parent()?.node.id).toEqual('1');
  });

  it('should return correct global point', () => {
    const childModel = () =>
      new NodeModel({
        id: '2',
        parentId: '1',
        type: 'default',
        point: { x: 10, y: 10 },
      });

    entitiesService.nodes.update((nodes) => [...nodes, TestBed.runInInjectionContext(childModel)]);

    expect(model.children()[0].globalPoint()).toEqual({ x: 25, y: 25 });
  });

  it('should get text for default node', () => {
    expect(model.text()).toEqual('test');
  });
});
