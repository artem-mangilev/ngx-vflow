import { ConnectionSettings } from "../interfaces/connection-settings.interface";
import { Curve, EdgeType } from "../interfaces/edge.interface";

export class ConnectionModel {
  public curve: Curve
  public type: EdgeType

  constructor(public connection: ConnectionSettings) {
    this.curve = connection.curve ?? 'bezier'
    this.type = connection.type ?? 'default'
  }
}
