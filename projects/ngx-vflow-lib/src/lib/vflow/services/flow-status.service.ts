import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';
import { ConnectionInternal } from '../interfaces/connection.internal.interface';
import { EdgeModel } from '../models/edge.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';

export interface FlowStatusIdle {
  state: 'idle';
  payload: null;
}

export interface FlowStatusConnectionStart {
  state: 'connection-start';
  payload: Omit<ConnectionInternal, 'target' | 'targetHandle'>;
}

export interface FlowStatusConnectionValidation {
  state: 'connection-validation';
  payload: ConnectionInternal & {
    valid: boolean;
  };
}

export interface FlowStatusConnectionEnd {
  state: 'connection-end';
  payload: ConnectionInternal;
}

export interface FlowStatusConnectionDropped {
  state: 'connection-dropped';
  payload: Omit<ConnectionInternal, 'target' | 'targetHandle'>;
}

export interface FlowStatusReconnectionStart {
  state: 'reconnection-start';
  payload: Omit<ConnectionInternal, 'target' | 'targetHandle'> & {
    oldEdge: EdgeModel;
  };
}

export interface FlowStatusReconnectionValidation {
  state: 'reconnection-validation';
  payload: ConnectionInternal & {
    valid: boolean;
    oldEdge: EdgeModel;
  };
}

export interface FlowStatusReconnectionEnd {
  state: 'reconnection-end';
  payload: ConnectionInternal & {
    oldEdge: EdgeModel;
  };
}

export interface FlowStatusReconnectionDropped {
  state: 'reconnection-dropped';
  payload: Omit<ConnectionInternal, 'target' | 'targetHandle'> & {
    oldEdge: EdgeModel;
  };
}

export interface FlowStatusNodeDragStart {
  state: 'node-drag-start';
  payload: {
    node: NodeModel;
  };
}

export interface FlowStatusNodeDragEnd {
  state: 'node-drag-end';
  payload: {
    node: NodeModel;
  };
}

export type FlowStatus =
  | FlowStatusIdle
  | FlowStatusConnectionStart
  | FlowStatusConnectionValidation
  | FlowStatusConnectionEnd
  | FlowStatusConnectionDropped
  | FlowStatusReconnectionStart
  | FlowStatusReconnectionValidation
  | FlowStatusReconnectionEnd
  | FlowStatusReconnectionDropped
  | FlowStatusNodeDragStart
  | FlowStatusNodeDragEnd;

@Injectable()
export class FlowStatusService {
  public readonly status = signal<FlowStatus>({ state: 'idle', payload: null });
  public readonly status$ = toObservable(this.status).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  public setIdleStatus() {
    this.status.set({ state: 'idle', payload: null });
  }

  public setConnectionStartStatus(source: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: 'connection-start', payload: { source, sourceHandle } });
  }

  public setReconnectionStartStatus(source: NodeModel, sourceHandle: HandleModel, oldEdge: EdgeModel) {
    this.status.set({ state: 'reconnection-start', payload: { source, sourceHandle, oldEdge } });
  }

  public setConnectionValidationStatus(
    valid: boolean,
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
  ) {
    this.status.set({ state: 'connection-validation', payload: { source, target, sourceHandle, targetHandle, valid } });
  }

  public setReconnectionValidationStatus(
    valid: boolean,
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
    oldEdge: EdgeModel,
  ) {
    this.status.set({
      state: 'reconnection-validation',
      payload: { source, target, sourceHandle, targetHandle, valid, oldEdge },
    });
  }

  public setConnectionEndStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
  ) {
    this.status.set({ state: 'connection-end', payload: { source, target, sourceHandle, targetHandle } });
  }

  public setConnectionDroppedStatus(source: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: 'connection-dropped', payload: { source, sourceHandle } });
  }

  public setReconnectionEndStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
    oldEdge: EdgeModel,
  ) {
    this.status.set({ state: 'reconnection-end', payload: { source, target, sourceHandle, targetHandle, oldEdge } });
  }

  public setReconnectionDroppedStatus(source: NodeModel, sourceHandle: HandleModel, oldEdge: EdgeModel) {
    this.status.set({ state: 'reconnection-dropped', payload: { source, sourceHandle, oldEdge } });
  }

  public setNodeDragStartStatus(node: NodeModel) {
    this.status.set({ state: 'node-drag-start', payload: { node } });
  }

  public setNodeDragEndStatus(node: NodeModel) {
    this.status.set({ state: 'node-drag-end', payload: { node } });
  }
}

export function isNodeDragStartStatus(params: FlowStatus): params is FlowStatusNodeDragStart {
  return params.state === 'node-drag-start';
}

export function isNodeDragEndStatus(params: FlowStatus): params is FlowStatusNodeDragEnd {
  return params.state === 'node-drag-end';
}
