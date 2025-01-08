export interface Marker {
  type?: 'arrow' | 'arrow-closed';
  width?: number;
  height?: number;
  color?: string;
  orient?: string;
  markerUnits?: 'userSpaceOnUse' | 'strokeWidth';
  strokeWidth?: number;
}
