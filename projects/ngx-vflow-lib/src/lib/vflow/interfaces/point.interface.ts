export interface Point {
  x: number;
  y: number;
}

export interface LayeredPoint extends Point {
  nodeId: string | null;
}
