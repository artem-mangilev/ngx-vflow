export interface UiGeneratorSchema {
  /** Directory of the parts; overrides `componentsPath` of vflow.json and skips its question. */
  directory?: string;
  /** Import alias of the parts on the first run; skips its question. */
  importAlias?: string;
  /** Nx only: whether the library gets a build target on the first run; skips its question. */
  buildable?: boolean;
  /** Set by the Angular CLI schematic: paths go to the root tsconfig instead of an Nx library. */
  angularCli?: boolean;
}
