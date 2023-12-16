import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { HtmlStyleSheet } from "../interfaces/stylesheet.interface";
import { AnyViewModel } from "./any.view-model";
import { BlockViewModel } from "./block.view-model";

export class HtmlViewModel extends BlockViewModel {
  public styleSheet: Required<HtmlStyleSheet>

  constructor(
    public component: VDocViewComponent,
    styleSheet: HtmlStyleSheet,
  ) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet);
  }
}

function styleSheetWithDefaults(styles: HtmlStyleSheet): Required<HtmlStyleSheet> {
  return {
    width: styles.width ?? 0,
    height: styles.height ?? 0,
    marginLeft: styles.marginLeft ?? 0,
    marginRight: styles.marginRight ?? 0,
    marginBottom: styles.marginBottom ?? 0,
    marginTop: styles.marginTop ?? 0,
  }
}
