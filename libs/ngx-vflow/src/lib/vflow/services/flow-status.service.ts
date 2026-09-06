import { Injectable, effect, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';
import { ConnectionInternal } from '../interfaces/connection.internal.interface';
import { EdgeModel } from '../models/edge.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';

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

export interface FlowStatusNodeDrag {
  state: 'node-drag';
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

export interface FlowStatusSelectionBoxEnd {
  state: 'selection-box-end';
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
  | FlowStatusNodeDrag
  | FlowStatusNodeDragEnd
  | FlowStatusSelectionBoxEnd;

@Injectable()
export class FlowStatusService {
  public readonly status = signal<FlowStatus>({ state: 'idle', payload: null });
  public readonly status$ = toObservable(this.status).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  // Publish only connection changes to entity views. A computed projection would
  // still propagate every drag invalidation to all its consumers before equality is checked.
  public readonly connectionStatus = toSignal(
    this.status$.pipe(
      map((status) =>
        status.state === 'connection-start' ||
        status.state === 'connection-validation' ||
        status.state === 'reconnection-start' ||
        status.state === 'reconnection-validation'
          ? status
          : null,
      ),
    ),
    { initialValue: null },
  );

  public readonly connectionActive = signal(false);

  constructor() {
    let participants = new Set<NodeModel>();
    let candidate: HandleModel | undefined;
    let reconnecting: EdgeModel | undefined;
    effect(() => {
      const status = this.connectionStatus();
      const next = new Set<NodeModel>();
      const nextEdge = status && 'oldEdge' in status.payload ? status.payload.oldEdge : undefined;
      const nextCandidate = status && 'targetHandle' in status.payload ? status.payload.targetHandle : undefined;
      if (status) {
        next.add(status.payload.source);
        if ('target' in status.payload) next.add(status.payload.target);
        for (const node of [nextEdge?.source(), nextEdge?.target()]) if (node) next.add(node);
      }
      for (const node of participants) if (!next.has(node)) node.connectionActive.set(false);
      for (const node of next) if (!participants.has(node)) node.connectionActive.set(true);
      if (candidate && candidate !== nextCandidate) candidate.state.set('idle');
      if (nextCandidate && status && 'valid' in status.payload)
        nextCandidate.state.set(status.payload.valid ? 'valid' : 'invalid');
      if (reconnecting !== nextEdge) {
        reconnecting?.reconnecting.set(false);
        nextEdge?.reconnecting.set(true);
      }
      this.connectionActive.set(status !== null);
      participants = next;
      candidate = nextCandidate;
      reconnecting = nextEdge;
    });
  }

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

  public setNodeDragStatus(node: NodeModel) {
    this.status.set({ state: 'node-drag', payload: { node } });
  }

  public setNodeDragEndStatus(node: NodeModel) {
    this.status.set({ state: 'node-drag-end', payload: { node } });
  }

  public setSelectionBoxEndStatus() {
    this.status.set({ state: 'selection-box-end' });
  }
}

export function isNodeDragStartStatus(params: FlowStatus): params is FlowStatusNodeDragStart {
  return params.state === 'node-drag-start';
}

export function isNodeDragStatus(params: FlowStatus): params is FlowStatusNodeDrag {
  return params.state === 'node-drag';
}

export function isNodeDragEndStatus(params: FlowStatus): params is FlowStatusNodeDragEnd {
  return params.state === 'node-drag-end';
}

export function isSelectionBoxEndStatus(params: FlowStatus): params is FlowStatusSelectionBoxEnd {
  return params.state === 'selection-box-end';
}
