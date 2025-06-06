import { Connection } from './connection.interface';
import { CurveFactory } from './curve-factory.interface';
import { EdgeLabel, EdgeLabelPosition } from './edge-label.interface';
import { Marker } from './marker.interface';

export type EdgeType = 'default' | 'template';
export type Curve = 'straight' | 'bezier' | 'smooth-step' | 'step' | CurveFactory;

export interface Edge<T = unknown> extends Connection {
  id: string;
  type?: EdgeType;
  curve?: Curve;
  data?: T;
  edgeLabels?: { [position in EdgeLabelPosition]?: EdgeLabel };
  markers?: {
    start?: Marker;
    end?: Marker;
  };
  reconnectable?: boolean | 'source' | 'target';
}
