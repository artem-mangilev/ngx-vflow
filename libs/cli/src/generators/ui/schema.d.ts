export interface UiGeneratorSchema {
  /** Directory of the parts; overrides `componentsPath` of vflow.json and skips its question. */
  directory?: string;
  /** Set by the Angular CLI schematic: paths go to the root tsconfig instead of an Nx library. */
  angularCli?: boolean;
}
