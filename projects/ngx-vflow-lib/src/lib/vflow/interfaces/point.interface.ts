export interface Point {
  x: number;
  y: number;
}

export interface SpacePoint extends Point {
  spaceNodeId: string | null;
}
