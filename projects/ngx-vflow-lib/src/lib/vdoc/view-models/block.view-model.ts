import { VDocBlockComponent } from "../components/vdoc-block/vdoc-block.component";
import { BlockStyleSheet } from "../interfaces/stylesheet.interface";
import { AnyViewModel } from "./any.view-model";

export class BlockViewModel extends AnyViewModel {
  public width = 0;
  public height = 0;
  public x = 0;
  public y = 0;

  constructor(
    public readonly component: VDocBlockComponent,
    public readonly styleSheet: BlockStyleSheet
  ) {
    super();

    this.width = this.styleSheet.width;
  }

  calculateLayout() {
    // we need to know layout of children before we compute parent layout
    this.children.forEach(c => c.calculateLayout())

    this.setPosition()
    this.setHeight()
  }

  private setPosition() {
    if (!this.parent) return

    const prevSibling = this.parent.children[this.parent.children.indexOf(this) - 1]

    if (prevSibling && prevSibling instanceof BlockViewModel) {
      this.y = prevSibling.y + prevSibling.height + prevSibling.styleSheet.marginBottom
    }
  }

  private setHeight() {
    if (!this.parent) return

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
        }
      }

      this.height = height
    }
  }
}
