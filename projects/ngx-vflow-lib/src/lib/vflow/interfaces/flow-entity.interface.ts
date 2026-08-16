import { Signal, WritableSignal } from '@angular/core';

export interface FlowEntity {
  selected: WritableSignal<boolean>;
  preselected: WritableSignal<boolean>;
  selectable: Signal<boolean>;
  deletable: Signal<boolean>;
  focusable: Signal<boolean>;
  shouldLoad: Signal<boolean>;
}
