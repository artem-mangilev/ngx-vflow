# {{ NgDocPage.title }}

## Migration to >= v1.0

- remove imports of `VflowModule` and use `Vflow` instead (`Vflow` contains all public standalone components and directives).
- remove usage of the `computeLayersOnInit` setting from the `Optimization` interface
- remove usage of the `handlePositions` input in the `VflowComponent`
- for classes extending `CustomNodeComponent` and `CustomDynamicNodeComponent`:
  - replace `this.node` to `this.node()` due to signal input internal migration
