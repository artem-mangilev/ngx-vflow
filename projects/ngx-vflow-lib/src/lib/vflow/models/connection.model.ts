import { ConnectionSettings, ConnectionValidatorFn } from "../interfaces/connection-settings.interface";
import { Curve, EdgeType } from "../interfaces/edge.interface";
import { ConnectionMode } from "../types/connection-mode.type";

export class ConnectionModel {
  public curve: Curve
  public type: EdgeType
  public validator: ConnectionValidatorFn
  public mode: ConnectionMode

  constructor(public connection: ConnectionSettings) {
    this.curve = connection.curve ?? 'bezier'
    this.type = connection.type ?? 'default'
    this.validator = connection.validator ?? (() => true)
    this.mode = connection.mode ?? 'strict'
  }
}
