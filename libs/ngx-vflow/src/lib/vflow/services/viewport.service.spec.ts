import { TestBed } from '@angular/core/testing';

import { ViewportChange, ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;
  const from: ViewportState = { x: 0, y: 0, zoom: 1 };
  const center = { x: 100, y: 50 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, ViewportService],
    });
    service = TestBed.inject(ViewportService);
  });

  it('keeps changes requested before the pane exists and applies them in order once it connects', () => {
    service.change({ zoom: 2 });
    service.change({ x: 10, y: 20 }, 100);

    const applied: ViewportChange[] = [];
    service.connect((change) => applied.push(change));

    expect(applied.map(({ target, duration }) => [target(from, center), duration])).toEqual([
      [{ x: -100, y: -50, zoom: 2 }, 0],
      [{ x: 10, y: 20, zoom: 1 }, 100],
    ]);
  });

  it('applies a change at once while connected and queues it again after the pane disconnects', () => {
    const applied: ViewportChange[] = [];
    const disconnect = service.connect((change) => applied.push(change));
    service.change({ zoom: 2 });
    expect(applied.length).toBe(1);

    disconnect();
    service.change({ zoom: 3 });
    expect(applied.length).toBe(1);

    service.connect((change) => applied.push(change));
    expect(applied.map(({ target }) => target(from, center)?.zoom)).toEqual([2, 3]);
  });

  it('settles a change with what the pane reports, and a change that never applied with false', async () => {
    service.connect((change) => change.done(true));
    expect(await service.change({ zoom: 2 })).toBe(true);

    const disconnect = service.connect(() => undefined);
    disconnect();
    const pending = service.change({ zoom: 3 });
    TestBed.resetTestingModule();
    expect(await pending).toBe(false);
  });
});
