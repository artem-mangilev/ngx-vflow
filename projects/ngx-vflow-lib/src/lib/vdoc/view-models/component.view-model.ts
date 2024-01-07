import { BlockStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";


export class ComponentViewModel extends BlockViewModel {
  public styleSheet: Required<BlockStyleSheet>;

  constructor(styleSheet: BlockStyleSheet) {
    super()

    this.styleSheet = blockStyleSheetWithDefaults(styleSheet)
  }
}
