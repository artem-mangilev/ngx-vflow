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

export interface FlowStatusConnectionRelease {
  state: 'connection-release';
  payload: ConnectionInternal;
}

export interface FlowStatusConnectionReleaseValidated {
  state: 'connection-release-validated';
  payload: ConnectionInternal & {
    valid: boolean;
  };
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

export interface FlowStatusReconnectionRelease {
  state: 'reconnection-release';
  payload: ConnectionInternal & {
    oldEdge: EdgeModel;
  };
}

export interface FlowStatusReconnectionReleaseValidated {
  state: 'reconnection-release-validated';
  payload: ConnectionInternal & {
    oldEdge: EdgeModel;
    valid: boolean;
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
  | FlowStatusConnectionRelease
  | FlowStatusConnectionReleaseValidated
  | FlowStatusConnectionDropped
  | FlowStatusReconnectionStart
  | FlowStatusReconnectionValidation
  | FlowStatusReconnectionRelease
  | FlowStatusReconnectionReleaseValidated
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

  public setConnectionReleaseStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
  ) {
    this.status.set({ state: 'connection-release', payload: { source, target, sourceHandle, targetHandle } });
  }

  public setConnectionReleaseValidatedStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
    valid: boolean,
  ) {
    this.status.set({
      state: 'connection-release-validated',
      payload: { source, target, sourceHandle, targetHandle, valid },
    });
  }

  public setConnectionDroppedStatus(source: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: 'connection-dropped', payload: { source, sourceHandle } });
  }

  public setReconnectionReleaseStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
    oldEdge: EdgeModel,
  ) {
    this.status.set({
      state: 'reconnection-release',
      payload: { source, target, sourceHandle, targetHandle, oldEdge },
    });
  }

  public setReconnectionReleaseValidatedStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
    oldEdge: EdgeModel,
    valid: boolean,
  ) {
    this.status.set({
      state: 'reconnection-release-validated',
      payload: { source, target, sourceHandle, targetHandle, oldEdge, valid },
    });
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
