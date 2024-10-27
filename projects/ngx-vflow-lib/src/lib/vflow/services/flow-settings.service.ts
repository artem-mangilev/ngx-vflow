import { Injectable, WritableSignal, signal } from '@angular/core';
import { HandlePositions } from '../interfaces/handle-positions.interface';
import { Background } from '../types/background.type';

@Injectable()
export class FlowSettingsService {
  public entitiesSelectable = signal(true)

  /**
   * Global setting with handle positions. Nodes derive this value
   *
   * @deprecated
   */
  public handlePositions: WritableSignal<HandlePositions> = signal({ source: 'right', target: 'left' })

  /**
   * @see {VflowComponent.view}
   */
  public view: WritableSignal<[number, number] | 'auto'> = signal([400, 400])

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowWidth = signal(0)

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowHeight = signal(0)

  public minZoom = signal(0.5)

  public maxZoom = signal(3)

  public background = signal<Background>({ type: 'solid', color: '#fff' })
}
