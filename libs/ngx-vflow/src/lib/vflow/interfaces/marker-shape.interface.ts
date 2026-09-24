import { TemplateRef } from '@angular/core';

/** A marker shape the application declares with `ng-template[marker]`, keyed by its type in the flow. */
export interface MarkerShape {
  template: TemplateRef<void>;
  /** Marker units between the path end and the tip of the shape. */
  inset: number;
}
