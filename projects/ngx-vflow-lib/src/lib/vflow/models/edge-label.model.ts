import { signal } from '@angular/core';
import { EdgeLabel } from '../interfaces/edge-label.interface';

export class EdgeLabelModel {
  public size = signal({ width: 0, height: 0 });

  constructor(public edgeLabel: EdgeLabel) {}
}
