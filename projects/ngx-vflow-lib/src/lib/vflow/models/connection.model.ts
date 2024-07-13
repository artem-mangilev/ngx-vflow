import { ConnectionSettings, ConnectionValidatorFn } from "../interfaces/connection-settings.interface";
import { Connection } from "../interfaces/connection.interface";
import { Curve, EdgeType } from "../interfaces/edge.interface";
import { ConnectionMode } from "../types/connection-mode.type";

export class ConnectionModel {
  public curve: Curve
  public type: EdgeType
  public validator: ConnectionValidatorFn
  public mode: ConnectionMode

  constructor(public settings: ConnectionSettings) {
    this.curve = settings.curve ?? 'bezier'
    this.type = settings.type ?? 'default'
    this.mode = settings.mode ?? 'strict'

    const validatorsToRun = this.getValidators(settings)
    this.validator = (connection) => validatorsToRun.every((v) => v(connection))
  }

  private getValidators(settings: ConnectionSettings) {
    const validators = []

    validators.push(notSelfValidator)

    if (this.mode === 'loose') {
      validators.push(hasSourceAndTargetHandleValidator)
    }

    if (settings.validator) {
      validators.push(settings.validator)
    }

    return validators;
  }
}

/**
 * Internal validator that not allows self connections
 */
const notSelfValidator = (connection: Connection) => {
  return connection.source !== connection.target
}

const hasSourceAndTargetHandleValidator = (connection: Connection) => {
  return connection.sourceHandle !== undefined && connection.targetHandle !== undefined
}
