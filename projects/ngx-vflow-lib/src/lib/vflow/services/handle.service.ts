import { Injectable, Signal, TemplateRef, signal } from '@angular/core';
import { Position } from '../types/position.type';
import { HandleType } from '../types/handle-type.type';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';

export interface NodeHandle {
  position: Position;
  type: HandleType;
  userOffsetX: number;
  userOffsetY: number;
  id?: string;
  hostReference?: Element;
  template?: TemplateRef<any> | null;
  canStart?: Signal<boolean>;
  canAccept?: Signal<boolean>;
}

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
