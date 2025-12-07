import { Signal } from '@angular/core';

import { Edge } from './edge.interface';
import { HtmlTemplateEdgeLabel } from './edge-label.interface';
import { Point } from './point.interface';
import { HandleState } from '../models/handle.model';
import { HtmlTemplateNode, SvgTemplateNode, TemplateGroupNode } from './node.interface';

export interface EdgeContext {
  $implicit: {
    edge: Edge<any>;
    data: Signal<any>;
    path: Signal<string>;
    markerStart: Signal<string>;
    markerEnd: Signal<string>;
    selected: Signal<boolean>;
    shouldLoad: Signal<boolean>;
  };
}

export interface NodeContext {
  $implicit: {
    node: HtmlTemplateNode;
    data: Signal<any>;
    selected: Signal<boolean>;
    shouldLoad: Signal<boolean>;
  };
}

export interface SvgNodeContext {
  $implicit: {
    node: SvgTemplateNode;
    data: Signal<any>;
    selected: Signal<boolean>;
    width: Signal<number>;
    height: Signal<number>;
    shouldLoad: Signal<boolean>;
  };
}

export interface GroupNodeContext {
  $implicit: {
    node: TemplateGroupNode;
    data: Signal<any>;
    selected: Signal<boolean>;
    width: Signal<number>;
    height: Signal<number>;
    shouldLoad: Signal<boolean>;
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
