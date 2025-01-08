import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';
import { ConnectionInternal } from '../interfaces/connection.internal.interface';

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

export type FlowStatus =
  | FlowStatusIdle
  | FlowStatusConnectionStart
  | FlowStatusConnectionValidation
  | FlowStatusConnectionEnd;

@Injectable()
export class FlowStatusService {
  public readonly status = signal<FlowStatus>({ state: 'idle', payload: null });

  public setIdleStatus() {
    this.status.set({ state: 'idle', payload: null });
  }

  public setConnectionStartStatus(source: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: 'connection-start', payload: { source, sourceHandle } });
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

  public setConnectionEndStatus(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel,
  ) {
    this.status.set({ state: 'connection-end', payload: { source, target, sourceHandle, targetHandle } });
  }
}

/**
 * Batch status changes together to call them one after another
 *
 * @param changes list of set[FlowStatus.state]Status() calls
 */
export function batchStatusChanges(...changes: (() => void)[]) {
  if (changes.length) {
    const [firstChange, ...restChanges] = changes;
    // first change is sync
    firstChange();
    // without timer, subscribed effects/comuted signals only get latest value
    restChanges.forEach((change) => setTimeout(() => change()));
  }
}
