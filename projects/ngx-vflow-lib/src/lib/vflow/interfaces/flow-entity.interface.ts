import { Signal, WritableSignal } from "@angular/core";

export interface FlowEntity {
  selectable: WritableSignal<boolean>
  selected: WritableSignal<boolean>
}
