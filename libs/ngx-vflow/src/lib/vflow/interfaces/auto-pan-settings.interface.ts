/** Auto-pan settings. Omitted fields keep their defaults; the flow follows later changes of the binding. */
export interface AutoPanSettings {
  /** Enable auto-pan during node dragging. Defaults to true. */
  nodeDrag?: boolean;
  /** Enable auto-pan during connection creation and reconnection. Defaults to true. */
  connectionDrag?: boolean;
  /** Maximum per-axis speed in viewport pixels per second. Defaults to 600; zero disables auto-pan. */
  speed?: number;
  /** Activation distance from viewport edges in pixels. Defaults to 48; zero disables auto-pan. */
  margin?: number;
}
