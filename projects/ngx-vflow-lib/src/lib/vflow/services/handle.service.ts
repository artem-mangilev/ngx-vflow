import { Injectable, Signal, signal } from '@angular/core';
import { Position } from '../types/position.type';
import { HandleType } from '../types/handle-type.type';
import { Point } from '../interfaces/point.interface';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';

export interface NodeHandle {
  position: Position
  type: HandleType
  id?: string
  parentReference?: HTMLElement
}

@Injectable()
export class HandleService {
  public readonly node = signal<NodeModel | null>(null)

  public createHandle(newHandle: HandleModel) {
    const node = this.node()
    if (node) {
      node.handles.update(handles => [...handles, newHandle])
    }
  }

  public destroyHandle(handleToDestoy: HandleModel) {
    const node = this.node()
    // TODO: microtask
    if (node) {
      queueMicrotask(() => node.handles.update(
        handles => handles.filter(handle => handle !== handleToDestoy)
      ));
    }
  }
}
