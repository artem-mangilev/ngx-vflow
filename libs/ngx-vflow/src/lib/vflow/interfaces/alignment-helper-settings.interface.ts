export interface AlignmentHelperSettings {
  /**
   * Distance in screen pixels within which a dragged node snaps to an alignment, the same at any zoom. Default: 10.
   * Appearance is CSS: `--v-foreground`, or `color` and `opacity` on the `.v-alignment-guides` group.
   */
  tolerance: number;
}
