import { Signal } from '@angular/core';
import { Edge } from './edge.interface';

export interface EdgeContext {
  $implicit: {
    edge: Edge;
    path: Signal<string>;
    markerStart: Signal<string>;
    markerEnd: Signal<string>;
    selected: Signal<boolean>;
  };
}
