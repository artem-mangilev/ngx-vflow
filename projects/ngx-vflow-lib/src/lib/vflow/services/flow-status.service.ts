import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';

export interface FlowStatusIdle {
  state: 'idle',
  payload: null
}

export interface FlowStatusConnectionStart {
  state: 'connection-start',
  payload: {
    sourceNode: NodeModel
    sourceHandle: HandleModel
  }
}

export interface FlowStatusConnectionValidation {
  state: 'connection-validation',
  payload: {
    sourceNode: NodeModel
    targetNode: NodeModel
    sourceHandle: HandleModel
    targetHandle: HandleModel
    valid: boolean
  }
}

export interface FlowStatusConnectionEnd {
  state: 'connection-end',
  payload: {
    sourceNode: NodeModel
    targetNode: NodeModel
    sourceHandle: HandleModel,
    targetHandle: HandleModel
  }
}

export type FlowStatus =
  FlowStatusIdle |
  FlowStatusConnectionStart |
  FlowStatusConnectionValidation |
  FlowStatusConnectionEnd

@Injectable()
export class FlowStatusService {
  public readonly status = signal<FlowStatus>({ state: 'idle', payload: null })

  public setIdleStatus() {
    this.status.set({ state: 'idle', payload: null })
  }

  public setConnectionStartStatus(sourceNode: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: 'connection-start', payload: { sourceNode, sourceHandle } })
  }

  public setConnectionValidationStatus(
    valid: boolean,
    sourceNode: NodeModel,
    targetNode: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel
  ) {
    this.status.set({ state: 'connection-validation', payload: { sourceNode, targetNode, sourceHandle, targetHandle, valid } })
  }

  public setConnectionEndStatus(sourceNode: NodeModel, targetNode: NodeModel, sourceHandle: HandleModel, targetHandle: HandleModel) {
    this.status.set({ state: 'connection-end', payload: { sourceNode, targetNode, sourceHandle, targetHandle } })
  }
}

/**
 * Batch status changes together to call them one after another
 *
 * @param changes list of set[FlowStatus.state]Status() calls
 */
export function batchStatusChanges(...changes: Function[]) {
  if (changes.length) {
    const [firstChange, ...restChanges] = changes
    // first change is sync
    firstChange()
    // without timer, subscribed effects/comuted signals only get latest value
    restChanges.forEach(change => setTimeout(() => change()))
  }
}
