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

    this.calculateHeight()
    this.calculateWidth()
    this.calculatePosition()

    this.updateView()
  }

  public setHeight(height: number) {
    // TODO prob bad idea to mutate styleSheet instance
    this.styleSheet.height = height;
  }

  protected calculatePosition() {
    // TODO maybe override parent in this class, because block always have parent
    if (!this.parent) return

    // Compute y
    let y = 0
    y += this.styleSheet.marginTop
    // Current block rendered based on it's prev sibling
    const prevSibling = this.parent.children[this.parent.children.indexOf(this) - 1]
    if (prevSibling && prevSibling instanceof BlockViewModel) {
      y += prevSibling.y + prevSibling.height + prevSibling.styleSheet.marginBottom
    }

    // Compute x
    let x = 0
    if (
      // Both horizontal margins are auto
      this.styleSheet.marginLeft === 'auto' &&
      this.styleSheet.marginRight === 'auto'
    ) {
      const parentWidth = getModelWidth(this.parent!)

      x = (parentWidth / 2) - (this.width / 2)
    } else if (
      // Both horizontal margins are absolute values
      typeof this.styleSheet.marginLeft === 'number' &&
      typeof this.styleSheet.marginRight === 'number'
    ) {
      x += this.styleSheet.marginLeft
    } else {
      // TODO unhandled
      x = 0
    }

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
    this.width = getModelWidth(this)
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

/**
 * Compute width for model based on its ancestors
 *
 * @param model
 * @returns
 */
function getModelWidth(model: AnyViewModel) {
  const chainFromRoot = flatToRoot(model)

  const [root] = chainFromRoot
  let width = root.width;

  chainFromRoot
    .filter(isBlock)
    .forEach(item => {
      // we know width either from styles
      if (item.styleSheet.width) {
        width = item.styleSheet.width
      } else {
        // or if styles has no width, we compute it from margins
        if (typeof item.styleSheet.marginLeft === 'number') {
          width -= item.styleSheet.marginLeft
        }

        if (typeof item.styleSheet.marginRight === 'number') {
          width -= item.styleSheet.marginRight
        }
      }
    })

  return width
}

export function styleSheetWithDefaults(styles: BlockStyleSheet): Required<BlockStyleSheet> {
  return {
    width: styles.width ?? 0,
    height: styles.height ?? 0,
    marginLeft: styles.marginLeft ?? 0,
    marginRight: styles.marginRight ?? 0,
    marginBottom: styles.marginBottom ?? 0,
    marginTop: styles.marginTop ?? 0,
  }
}
