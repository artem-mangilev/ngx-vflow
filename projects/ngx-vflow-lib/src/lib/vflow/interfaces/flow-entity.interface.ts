import { Signal, WritableSignal } from "@angular/core";

export interface FlowEntity {
  selected: WritableSignal<boolean>
}
