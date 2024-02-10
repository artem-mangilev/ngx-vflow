import { ConnectionSettings } from "../interfaces/connection-settings.interface";
import { Curve } from "../interfaces/edge.interface";

export class ConnectionModel {
  public curve: Curve

  constructor(public connection: ConnectionSettings) {
    this.curve = connection.curve ?? 'bezier'
  }
}
