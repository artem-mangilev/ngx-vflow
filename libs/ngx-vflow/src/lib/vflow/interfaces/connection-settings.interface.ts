import { HandleType } from '../types/handle-type.type';
import { Connection } from './connection.interface';
import { Curve } from './edge.interface';
import { MarkerRef } from './marker.interface';

export type ConnectionForValidation = Connection & {
  sourceHandleType: HandleType;
  targetHandleType: HandleType;
};

export type ConnectionValidatorFn = (connection: ConnectionForValidation) => boolean;

/** Settings of the connection gesture. The preview renders the `connection` template when one is declared. */
export interface ConnectionSettings {
  curve?: Curve;
  validator?: ConnectionValidatorFn;
  /** End marker of the connection line, see `MarkerRef`. */
  marker?: MarkerRef;
  allowSelfConnections?: boolean;
}
