import { Connection } from "./connection.interface";
import { Curve, EdgeType } from "./edge.interface";

export type ConnectionValidatorFn = (connection: Connection) => boolean

export interface ConnectionSettings {
  curve?: Curve
  type?: EdgeType
  validator?: ConnectionValidatorFn
}

