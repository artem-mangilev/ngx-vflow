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
    this.height = this.styleSheet.height;
  }

  calculateLayout() {
    if (this.parent) {
      const currentModelIndex = this.parent.children.findIndex((block) => block === this)
      const prevSibling = this.parent.children[currentModelIndex - 1]

      if (prevSibling && prevSibling instanceof BlockViewModel) {
        this.y = prevSibling.y + prevSibling.height + prevSibling.styleSheet.marginBottom
      }
    }
  }
}
