import { Signal } from '@angular/core';

import { Edge } from './edge.interface';
import { HtmlTemplateEdgeLabel } from './edge-label.interface';
import { Point } from './point.interface';
import { HandleState } from '../models/handle.model';

export interface EdgeContext {
  $implicit: {
    edge: Edge<any>;
    path: Signal<string>;
    markerStart: Signal<string>;
    markerEnd: Signal<string>;
    selected: Signal<boolean>;
  };
}

export interface NodeContext {
  $implicit: {
    // TODO: type properly when separate template directives to static and dynamic nodes
    node: any;
    selected: Signal<boolean>;
  };
}

export interface SvgNodeContext {
  $implicit: {
    node: any;
    selected: Signal<boolean>;
    width: Signal<number>;
    height: Signal<number>;
  };
}

export interface GroupNodeContext {
  $implicit: {
    node: any;
    selected: Signal<boolean>;
    width: Signal<number>;
    height: Signal<number>;
  };
}

export interface ConnectionContext {
  $implicit: {
    path: Signal<string | null>;
    marker: Signal<string>;
  };
}

export interface HtmlEdgeLabelContext {
  $implicit: {
    edge: Edge<any>;
    label: HtmlTemplateEdgeLabel<any>;
  };
}

export interface HandleContext {
  $implicit: {
    point: Signal<Point>;
    state: Signal<HandleState>;
    node: any;
  };
}
