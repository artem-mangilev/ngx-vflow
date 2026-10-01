import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ViewportChange } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let service: ViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, ViewportService, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ViewportService);
  });

  it('keeps changes requested before the pane exists and applies them in order once it connects', () => {
    service.change({ zoom: 2 });
    service.change({ x: 10, y: 20 }, 100);

    const applied: ViewportChange[] = [];
    service.connect((change) => applied.push(change));

    expect(applied).toEqual([
      { state: { zoom: 2 }, duration: 0 },
      { state: { x: 10, y: 20 }, duration: 100 },
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
    expect(applied.map(({ state }) => state)).toEqual([{ zoom: 2 }, { zoom: 3 }]);
  });
});
