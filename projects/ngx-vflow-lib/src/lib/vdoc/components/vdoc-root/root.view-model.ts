import { Signal, signal } from "@angular/core";
import { RootStyleSheet } from "../../../../public-api";
import { AnyViewModel } from "../../view-models/any.view-model";
import { BlockViewModel } from "../../view-models/block.view-model";

export class RootViewModel extends AnyViewModel {
  public width = signal(0)
  public height = signal(0)

  public readonly styleSheet: Required<RootStyleSheet>

  constructor(styleSheet: RootStyleSheet) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }

  public calculateLayout(): void {
    this.children.forEach(c => c.calculateLayout())

    this.setWidth()
    this.setHeight()
  }

  private setWidth() {
    this.width.set(this.styleSheet.width())
  }

  /**
   * Set height fot root view
   *
   * @todo copy-paste from block.view-model
   */
  private setHeight() {
    if (this.styleSheet.height()) {
      // if styles has height, use it

      this.height.set(this.styleSheet.height())
    } else {
      // otherwise compute height based on children

      let height = 0

      for (const c of this.children) {
        if (c instanceof BlockViewModel) {
          height += c.height()
          height += c.styleSheet.marginBottom()
          height += c.styleSheet.marginTop()
        }
      }

      this.height.set(height)
    }
  }
}
export function styleSheetWithDefaults(styles: RootStyleSheet): Required<RootStyleSheet> {
  return {
    width: styles.width ?? signal(0),
    height: styles.height ?? signal(0)
  }
}
