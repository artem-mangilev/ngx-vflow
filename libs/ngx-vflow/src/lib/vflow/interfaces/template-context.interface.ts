import { Signal } from '@angular/core';

import { HandleState } from '../models/handle.model';
import { NodeRef } from '../utils/inject-node';
import { EdgeRef } from '../utils/inject-edge';

export interface EdgeContext {
  $implicit: EdgeRef;
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

export interface HandleContext {
  $implicit: {
    state: Signal<HandleState>;
    node: any;
    canStart: Signal<boolean>;
    canAccept: Signal<boolean>;
  };
}
