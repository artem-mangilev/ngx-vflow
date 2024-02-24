import { Connection } from "./connection.interface";
import { Curve, EdgeType } from "./edge.interface";
import { Marker } from "./marker.interface";

export type ConnectionValidatorFn = (connection: Connection) => boolean

export interface ConnectionSettings {
  curve?: Curve
  type?: EdgeType
  validator?: ConnectionValidatorFn
  marker?: Marker
}

