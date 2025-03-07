import { Injectable, WritableSignal, signal } from '@angular/core';
import { Background } from '../types/background.type';

@Injectable()
export class FlowSettingsService {
  public entitiesSelectable = signal(true);

  public elevateNodesOnSelect = signal(true);

  /**
   * @see {VflowComponent.view}
   */
  public view: WritableSignal<[number, number] | 'auto'> = signal([400, 400]);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowWidth = signal(0);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowHeight = signal(0);

  public minZoom = signal(0.5);

  public maxZoom = signal(3);

  public background = signal<Background>({ type: 'solid', color: '#fff' });

  public snapGrid = signal<[number, number]>([1, 1]);
}
