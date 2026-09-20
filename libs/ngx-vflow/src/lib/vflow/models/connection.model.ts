import { ConnectionSettings, ConnectionValidatorFn } from '../interfaces/connection-settings.interface';
import { Curve } from '../interfaces/edge.interface';

export class ConnectionModel {
  public curve: Curve;
  public validator: ConnectionValidatorFn;
  public allowSelfConnections: boolean;

  constructor(public settings: ConnectionSettings) {
    this.curve = settings.curve ?? 'bezier';
    this.allowSelfConnections = settings.allowSelfConnections ?? false;

    const validators: ConnectionValidatorFn[] = [notSameTypedHandlesValidator];

    if (!this.allowSelfConnections) {
      validators.push(notSelfValidator);
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
 * Internal validator that rejects a connection between two `source` or two `target` handles. A handle of type
 * `any` connects in either direction.
 */
const notSameTypedHandlesValidator: ConnectionValidatorFn = (connection) => {
  const { sourceHandleType, targetHandleType } = connection;

  return sourceHandleType === 'any' || targetHandleType === 'any' || sourceHandleType !== targetHandleType;
};
