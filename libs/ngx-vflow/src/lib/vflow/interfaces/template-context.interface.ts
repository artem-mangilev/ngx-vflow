import { Signal } from '@angular/core';

import { Edge } from './edge.interface';
import { HtmlTemplateEdgeLabel } from './edge-label.interface';
import { HandleState } from '../models/handle.model';
import { NodeRef } from '../utils/inject-node';

export interface EdgeContext {
  $implicit: {
    edge: Edge<any>;
    data: Signal<any>;
    path: Signal<string>;
    markerStart: Signal<string>;
    markerEnd: Signal<string>;
    selected: Signal<boolean>;
    preselected: Signal<boolean>;
    shouldLoad: Signal<boolean>;
  };
}

export interface NodeContext {
  $implicit: NodeRef;
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
    state: Signal<HandleState>;
    node: any;
    canStart: Signal<boolean>;
    canAccept: Signal<boolean>;
  };
}
