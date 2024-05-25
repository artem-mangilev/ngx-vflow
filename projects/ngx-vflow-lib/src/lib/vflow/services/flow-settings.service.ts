import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { HandlePositions } from '../interfaces/handle-positions.interface';

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

  public flowWidth = computed(() => this.view() === 'auto' ? '100%' : this.view()[0])

  public flowHeight = computed(() => this.view() === 'auto' ? '100%' : this.view()[1])

}
