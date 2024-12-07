export interface Optimization {
  /**
   * If true, compute the right nodes order by z-axis inside groups on initial render.
   *
   * @default true
   * @deprecated
   */
  computeLayersOnInit: boolean

  /**
   * If true, the layer with groups will be placed behind the edges layer.
   * This approach fixes the issue when you can't select an edge inside group.
   *
   * @default false
   */
  detachedGroupsLayer: boolean
}
