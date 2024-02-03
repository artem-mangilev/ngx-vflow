import { Signal, WritableSignal, signal } from "@angular/core";
import { HandlePositions } from "../interfaces/handle-positions.interface";

export class FlowModel {
  /**
   * Global setting with handle positions. Nodes derive this value
   */
  public handlePositions: WritableSignal<HandlePositions> = signal({ source: 'right', target: 'left' })
}
