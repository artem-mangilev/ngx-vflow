import { ConnectionSettings, ConnectionValidatorFn } from '../interfaces/connection-settings.interface';
import { Curve } from '../interfaces/edge.interface';

export class ConnectionModel {
  public curve: Curve;
  public validator: ConnectionValidatorFn;
  public allowSelfConnections: boolean;
  public allowDuplicateConnections: boolean;

  constructor(public settings: ConnectionSettings) {
    this.curve = settings.curve ?? 'bezier';
    this.allowSelfConnections = settings.allowSelfConnections ?? false;
    this.allowDuplicateConnections = settings.allowDuplicateConnections ?? false;

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
const notSelfValidator: ConnectionValidatorFn = ({ source, target }) => {
  return source.node.id !== target.node.id;
};

/**
 * Internal validator that rejects a connection between two `source` or two `target` handles. A handle of type
 * `any` connects in either direction.
 */
const notSameTypedHandlesValidator: ConnectionValidatorFn = ({ source, target }) => {
  const sourceType = source.handle.type;
  const targetType = target.handle.type;

  return sourceType === 'any' || targetType === 'any' || sourceType !== targetType;
};
