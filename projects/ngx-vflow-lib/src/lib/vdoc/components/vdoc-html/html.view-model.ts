import { VDocViewComponent } from "../vdoc-view/vdoc-view.component";
import { BlockStyleSheet, HtmlStyleSheet } from "../../interfaces/stylesheet.interface";
import { BlockViewModel } from "../../view-models/block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "../../view-models/block.view-model";

export class HtmlViewModel extends BlockViewModel {
  public styleSheet: Required<HtmlStyleSheet>

  constructor(styleSheet: HtmlStyleSheet) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }
}

function styleSheetWithDefaults(styles: HtmlStyleSheet): Required<HtmlStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles)
  }
}
