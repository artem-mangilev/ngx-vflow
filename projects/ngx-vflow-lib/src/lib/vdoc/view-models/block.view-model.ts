import { VDocBlockComponent } from "../components/vdoc-block/vdoc-block.component";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { BlockStyleSheet, ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { AnyViewModel } from "./any.view-model";
import { HtmlViewModel } from "./html.view-model";

export abstract class BlockViewModel extends AnyViewModel {
  public width = 0
  public height = 0
  public x = 0
  public y = 0

  public abstract override styleSheet: Required<BlockStyleSheet>;

  calculateLayout() {
    // we need to know layout of children before we compute parent layout
    this.children.forEach(c => c.calculateLayout())

    this.setPosition()
    this.setHeight()
    this.setWidth()
  }

  protected setPosition() {
    // TODO maybe override parent in this class, because block always have parent
    if (!this.parent) return

    const prevSibling = this.parent.children[this.parent.children.indexOf(this) - 1]

    this.y += this.styleSheet.marginTop
    // Current block rendered based on it's prev sibling
    if (prevSibling && prevSibling instanceof BlockViewModel) {
      this.y += prevSibling.y + prevSibling.height + prevSibling.styleSheet.marginBottom
    }

    this.x += this.styleSheet.marginLeft
  }

  /**
   * Set height for view
   */
  public setHeight() {
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

  /**
   * Set width for view
   */
  public setWidth() {
    if (this.styleSheet.width) {
      this.width = this.styleSheet.width
    } else {
      const chainFromRoot = flatToRoot(this)

      const [root] = chainFromRoot
      let width = root.width;

      chainFromRoot
        .filter(isBlock)
        .forEach(item => {
          width = width - item.styleSheet.marginLeft - item.styleSheet.marginRight
        })

      this.width = width
    }
  }
}

/**
 * Check if model is block (later block became abstract)
 *
 * @param model
 * @returns
 * @todo rename
 */
export function isBlock(model: AnyViewModel): model is BlockViewModel {
  return model instanceof BlockViewModel
}

/**
 * Get array of path from root to startModel
 *
 * @param startModel model to start from
 * @returns path array
 */
function flatToRoot(startModel: AnyViewModel): AnyViewModel[] {
  const chain: AnyViewModel[] = []

  let current: AnyViewModel | null = startModel
  while (current) {
    chain.push(current)
    current = current.parent
  }

  return chain.reverse();
}
