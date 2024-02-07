import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';

export interface FlowStatusIdle {
  state: 'idle',
  payload: null
}

export interface FlowStatusConnectionStart {
  state: 'connection-start',
  payload: {
    sourceNode: NodeModel
  }
}

export interface FlowStatusConnectionEnd {
  state: 'connection-end',
  payload: {
    sourceNode: NodeModel
    targetNode: NodeModel
  }
}

export type FlowStatus =
  FlowStatusIdle |
  FlowStatusConnectionStart |
  FlowStatusConnectionEnd

@Injectable()
export class FlowStatusService {
  public readonly status = signal<FlowStatus>({ state: 'idle', payload: null })

  public setIdleStatus() {
    this.status.set({ state: 'idle', payload: null })
  }

  public setConnectionStartStatus(sourceNode: NodeModel) {
    this.status.set({ state: 'connection-start', payload: { sourceNode } })
  }

  public setConnectionEndStatus(sourceNode: NodeModel, targetNode: NodeModel) {
    this.status.set({ state: 'connection-end', payload: { sourceNode, targetNode } })
  }
}
