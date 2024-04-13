import { Injectable, Signal, signal } from '@angular/core';
import { Position } from '../types/position.type';
import { HandleType } from '../types/handle-type.type';
import { Point } from '../interfaces/point.interface';

export interface NodeHandle {
  position: Position
  type: HandleType
  parentPosition: Signal<Point>
  parentSize: Signal<{ width: number, height: number }>
  id?: string
}

@Injectable()
export class HandleService {
  public readonly handles = signal<NodeHandle[]>([])

  public createHandle(newHandle: NodeHandle) {
    this.handles.update(handles => [...handles, newHandle])
  }

  public destroyHandle(handleToDestoy: NodeHandle) {
    this.handles.update(
      handles => handles.filter(handle => handle !== handleToDestoy)
    )
  }
}
