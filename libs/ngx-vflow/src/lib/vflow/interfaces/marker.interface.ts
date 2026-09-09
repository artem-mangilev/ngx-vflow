export interface Marker {
  type?: 'arrow' | 'arrow-closed';
  width?: number;
  height?: number;
  orient?: string;
  markerUnits?: 'userSpaceOnUse' | 'strokeWidth';
}
