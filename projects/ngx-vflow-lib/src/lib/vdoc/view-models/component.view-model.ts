import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { BlockStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";


export class ComponentViewModel extends BlockViewModel {
  public styleSheet: Required<BlockStyleSheet>;

  constructor(
    public component: VDocViewComponent,
    styleSheet: BlockStyleSheet,
  ) {
    super()

    this.styleSheet = blockStyleSheetWithDefaults(styleSheet)
  }
}
