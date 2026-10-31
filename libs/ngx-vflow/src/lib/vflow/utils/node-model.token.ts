import { InjectionToken } from '@angular/core';
import type { NodeModel } from '../models/node.model';

/** The model of the node an element is rendered in: a presentation, a handle, a drag handle or a resize control. */
export const NODE_MODEL = new InjectionToken<NodeModel>('NODE_MODEL');
