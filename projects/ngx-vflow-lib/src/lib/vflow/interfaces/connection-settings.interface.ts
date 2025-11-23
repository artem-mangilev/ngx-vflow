import { ConnectionMode } from '../types/connection-mode.type';
import { HandleType } from '../types/handle-type.type';
import { Connection } from './connection.interface';
import { Curve, EdgeType } from './edge.interface';
import { Marker } from './marker.interface';

export type ConnectionForValidation = Connection & {
  sourceHandleType: HandleType;
  targetHandleType: HandleType;
};

export type ConnectionValidatorFn = (connection: ConnectionForValidation) => boolean;

export interface ConnectionSettings {
  curve?: Curve;
  type?: EdgeType;
  validator?: ConnectionValidatorFn;
  marker?: Marker;
  mode?: ConnectionMode;
  allowSelfConnections?: boolean;
}
