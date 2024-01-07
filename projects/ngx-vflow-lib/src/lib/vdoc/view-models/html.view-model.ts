import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { BlockStyleSheet, HtmlStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";

export class HtmlViewModel extends BlockViewModel {
  public styleSheet: Required<HtmlStyleSheet>

  constructor(
    public component: VDocViewComponent,
    styleSheet: HtmlStyleSheet,
  ) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }
}

function styleSheetWithDefaults(styles: HtmlStyleSheet): Required<HtmlStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles)
  }
}
