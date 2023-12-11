import { RootStyleSheet } from "../../../public-api";
import { VDocRootComponent } from "../components/vdoc-root/vdoc-root.component";
import { AnyViewModel } from "./any.view-model";
import { BlockViewModel } from "./block.view-model";

export class RootViewModel extends AnyViewModel {
  public width
  public height = 0

  constructor(
    public readonly component: VDocRootComponent,
    public readonly styleSheet: RootStyleSheet
  ) {
    super()

    this.width = styleSheet.width
  }

  public calculateLayout(): void {
    this.children.forEach(c => c.calculateLayout())

    this.setHeight()
  }

  /**
   * Set height fot root view
   *
   * @todo copy-paste from block.view-model
   */
  private setHeight() {
    if (this.styleSheet.height) {
      // if styles has height, use it

      this.height = this.styleSheet.height
    } else {
      // otherwise compute height based on children

      let height = 0

      for (const c of this.children) {
        if (c instanceof BlockViewModel) {
          height += c.height
          height += c.styleSheet.marginBottom
          height += c.styleSheet.marginTop
        }
      }

      this.height = height
    }
  }
}
