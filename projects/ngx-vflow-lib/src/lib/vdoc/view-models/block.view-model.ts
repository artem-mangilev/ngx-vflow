import { BlockStyleSheet, ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { AnyViewModel } from "./any.view-model";

export abstract class BlockViewModel extends AnyViewModel {
  public width = 0
  public height = 0
  public x = 0
  public y = 0

  public abstract override styleSheet: Required<BlockStyleSheet>;

  calculateLayout() {
    // we need to know layout of children before we compute parent layout
    this.children.forEach(c => c.calculateLayout())

    this.calculatePosition()
    this.calculateHeight()
    this.calculateWidth()

    this.updateView()
  }

  public setHeight(height: number) {
    // TODO prob bad idea to mutate styleSheet instance
    this.styleSheet.height = height;
  }

  protected calculatePosition() {
    // TODO maybe override parent in this class, because block always have parent
    if (!this.parent) return

    const prevSibling = this.parent.children[this.parent.children.indexOf(this) - 1]

    let x = 0
    let y = 0

    y += this.styleSheet.marginTop
    // Current block rendered based on it's prev sibling
    if (prevSibling && prevSibling instanceof BlockViewModel) {
      y += prevSibling.y + prevSibling.height + prevSibling.styleSheet.marginBottom
    }

    x += this.styleSheet.marginLeft

    this.x = x
    this.y = y
  }

  /**
   * Set height for view
   */
  protected calculateHeight() {
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
  protected calculateWidth() {
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
