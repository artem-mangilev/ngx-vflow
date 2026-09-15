import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';

@Injectable()
export class HandleService {
  public readonly node = signal<NodeModel | null>(null);

  public createHandle(newHandle: HandleModel) {
    this.node()?.handles.update((handles) => [...handles, newHandle]);
  }

  public destroyHandle(handleToDestoy: HandleModel) {
    const node = this.node();
    if (node) {
      node.handles.update((handles) => handles.filter((handle) => handle !== handleToDestoy));
    }
  }
}
