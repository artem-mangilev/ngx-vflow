import { Injectable, signal } from '@angular/core';

/**
 * TODO: move props from flow.model to here
 */
@Injectable()
export class FlowSettingsService {
  public entitiesSelectable = signal(true)

}
