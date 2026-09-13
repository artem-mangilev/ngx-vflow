import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NodesChangeService } from './node-changes.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { NodeRenderingService } from './node-rendering.service';
import { ViewportService } from './viewport.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { NodeChange } from '../types/node-change.type';

describe('NodesChangeService', () => {
  let service: NodesChangeService;
  let entities: FlowEntitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NodesChangeService,
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(NodesChangeService);
    entities = TestBed.inject(FlowEntitiesService);
  });

  const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

  it('reports the size mode with every size change', async () => {
    const model = TestBed.runInInjectionContext(
      () =>
        new NodeModel(createNode({ id: '1', type: 'html-template', point: { x: 0, y: 0 } }, { useDefaults: false })),
    );
    const changes: NodeChange[] = [];
    service.changes$.subscribe((c) => changes.push(...c));
    entities.nodes.set([model]);
    await settle();

    model.width.set(120);
    await settle();
    expect(changes.at(-1)).toEqual({ type: 'size', id: '1', size: { width: 120, height: 50 }, mode: 'auto' });

    model.resizedExplicitly.set(true);
    model.height.set(80);
    await settle();
    expect(changes.at(-1)).toEqual({ type: 'size', id: '1', size: { width: 120, height: 80 }, mode: 'explicit' });
  });
});
