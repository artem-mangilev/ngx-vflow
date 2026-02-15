import { Injectable, TemplateRef, inject, signal } from '@angular/core';
import { Position } from '../types/position.type';
import { HandleType } from '../types/handle-type.type';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';
import { RequestAnimationFrameBatchingService } from './request-animation-frame-batching.service';

export interface NodeHandle {
  position: Position;
  type: HandleType;
  userOffsetX: number;
  userOffsetY: number;
  id?: string;
  hostReference?: Element;
  template?: TemplateRef<any> | null;
}

@Injectable()
export class HandleService {
  private afService = inject(RequestAnimationFrameBatchingService);

  public readonly node = signal<NodeModel | null>(null);
  private deleted = false;

  public createHandle(newHandle: HandleModel) {
    this.afService.batchAnimationFrame(() => {
      if (this.deleted) return;

      const node = this.node();
      if (node) {
        node.handles.update((handles) => [...handles, newHandle]);
      }
    });
  }

  public destroyHandle(handleToDestoy: HandleModel) {
    this.deleted = true;
    const node = this.node();
    if (node) {
      node.handles.update((handles) => handles.filter((handle) => handle !== handleToDestoy));
    }
  }
}
