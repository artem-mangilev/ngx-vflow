import { EdgeLabelPosition } from "./edge-label.interface";
import { Point } from "./point.interface";

export interface PathData {
  path: string;
  points: { [key in EdgeLabelPosition]: Point }
}
