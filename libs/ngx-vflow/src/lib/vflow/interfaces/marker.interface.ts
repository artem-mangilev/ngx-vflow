/**
 * Type of a marker: a shape the library ships (`arrow`, `arrow-closed`) or the id of a shape the application
 * declares with `ng-template[marker]`.
 */
export type MarkerType = 'arrow' | 'arrow-closed' | (string & {});

/** Marker type of a marker without `type`. */
export const MARKER_DEFAULT_TYPE: MarkerType = 'arrow-closed';

/**
 * A marker of an edge end or of the connection line. The flow renders one `<marker>` element per distinct marker
 * in its shared `<defs>`, for built-in and application-declared shapes alike; edges reference it by its id.
 * Markers take the stroke color of the edge that references them (`context-stroke`); size and orientation are
 * data, colors are CSS.
 */
export interface Marker {
  /** @default 'arrow-closed' */
  type?: MarkerType;
  width?: number;
  height?: number;
  orient?: string;
  markerUnits?: 'userSpaceOnUse' | 'strokeWidth';
}

/** A marker, or its type alone as a shorthand for `{ type }`. */
export type MarkerRef = MarkerType | Marker;
