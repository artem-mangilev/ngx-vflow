/**
 * Arrow markers shared by all edges of a flow. Markers take the stroke color of the edge that
 * references them (`context-stroke`); size and orientation are data, colors are CSS.
 */
export interface Marker {
  type?: 'arrow' | 'arrow-closed';
  width?: number;
  height?: number;
  orient?: string;
  markerUnits?: 'userSpaceOnUse' | 'strokeWidth';
}
