import { WritableSignal } from '@angular/core';

export interface FlowEntity {
  selected: WritableSignal<boolean>;
  shouldLoad: WritableSignal<boolean>;
}
