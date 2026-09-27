export interface AlignmentHelperSettings {
  /**
   * Distance in screen pixels within which a dragged node snaps to an alignment, the same at any zoom. Default: 10.
   * Line color is CSS: `--vflow-foreground` or the `.vflow-alignment-line` class.
   */
  tolerance: number;
}
