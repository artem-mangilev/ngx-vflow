export interface UiThemeGeneratorSchema {
  /** The application whose global stylesheet gets the theme. Asked for when the workspace has several. */
  project?: string;
  /** Path of the global stylesheet relative to the workspace root. Found in the application when omitted. */
  stylesEntryPoint?: string;
}
