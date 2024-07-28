export interface FitViewOptions {
  /**
   * Padding for viewport
   */
  padding?: number

  /**
   * Duration of animated transition to new viewport
   */
  duration?: number

  /**
   * Nodes that should be visible after fitView.
   * The whole flow will be visible if not passed or passed an empty array
   */
  nodes?: string[]
}
