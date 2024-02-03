import { signal } from "@angular/core"
import { EdgeLabel } from "../interfaces/edge-label.interface"

export class EdgeLabelModel {
  public width = signal(0)
  public height = signal(0)

  constructor(public edgeLabel: EdgeLabel) { }
}
