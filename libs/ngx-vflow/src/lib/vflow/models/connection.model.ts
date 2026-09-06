import { ConnectionSettings, ConnectionValidatorFn } from '../interfaces/connection-settings.interface';
import { Curve, EdgeType } from '../interfaces/edge.interface';
import { ConnectionMode } from '../types/connection-mode.type';

export class ConnectionModel {
  public curve: Curve;
  public type: EdgeType;
  public validator: ConnectionValidatorFn;
  public mode: ConnectionMode;
  public allowSelfConnections: boolean;

  constructor(public settings: ConnectionSettings) {
    this.curve = settings.curve ?? 'bezier';
    this.type = settings.type ?? 'default';
    this.mode = settings.mode ?? 'strict';
    this.allowSelfConnections = settings.allowSelfConnections ?? false;

    const validators: ConnectionValidatorFn[] = [];

    if (!this.allowSelfConnections) {
      validators.push(notSelfValidator);
    }

    if (this.mode === 'strict') {
      validators.push(notSameHandleTypeValidator);
    }

    if (this.mode === 'loose') {
      validators.push(hasSourceAndTargetHandleValidator);
    }

    if (settings.validator) {
      validators.push(settings.validator);
    }

    this.validator = (connection) => validators.every((v) => v(connection));
  }
}

/**
 * Internal validator that not allows self connections
 */
const notSelfValidator: ConnectionValidatorFn = (connection) => {
  return connection.source !== connection.target;
};

/**
 * Internal validator that not allows connections between handles of the same type
 */
const notSameHandleTypeValidator: ConnectionValidatorFn = (connection) => {
  return connection.sourceHandleType !== connection.targetHandleType;
};

const hasSourceAndTargetHandleValidator: ConnectionValidatorFn = (connection) => {
  return connection.sourceHandle !== undefined && connection.targetHandle !== undefined;
};
