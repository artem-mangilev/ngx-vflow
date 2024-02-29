import { ConnectionSettings, ConnectionValidatorFn } from "../interfaces/connection-settings.interface";
import { Curve, EdgeType } from "../interfaces/edge.interface";

export class ConnectionModel {
  public curve: Curve
  public type: EdgeType
  public validator: ConnectionValidatorFn

  constructor(public connection: ConnectionSettings) {
    this.curve = connection.curve ?? 'bezier'
    this.type = connection.type ?? 'default'
    this.validator = connection.validator ?? (() => true)
  }
}
