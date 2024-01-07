import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { BlockStyleSheet, ImageStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";

export class ImageViewModel extends BlockViewModel {
  public styleSheet: Required<ImageStyleSheet>

  constructor(styleSheet: ImageStyleSheet) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }
}

function styleSheetWithDefaults(styles: ImageStyleSheet): Required<ImageStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles)
  }
}
