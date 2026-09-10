import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';

/**
 * Service to fix cyclic dependency between node and resizable component
 */
@Injectable()
export class NodeAccessorService {
  public model = signal<NodeModel | null>(null);

  /** View-local sizing surface; CSS constraints can make it differ from the model-sized wrapper. */
  public resizerHost = signal<HTMLElement | null>(null);
}
