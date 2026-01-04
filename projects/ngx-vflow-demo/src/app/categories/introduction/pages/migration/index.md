## Migration to >= v1.0

- remove imports of `VflowModule` and use `Vflow` instead (`Vflow` contains all public standalone components and directives).
  - for standalone components, simply add `Vflow` to the `imports` array.
  - for modules, you need to spread `...Vflow` into the `imports` array; otherwise, you will get a type error.
- remove usage of the `computeLayersOnInit` setting from the `Optimization` interface.
- remove usage of the `handlePositions` input in the `VflowComponent`.
- for classes extending `CustomNodeComponent` and `CustomDynamicNodeComponent`:
  - replace `this.node` to `this.node()` due to signal input internal migration.
