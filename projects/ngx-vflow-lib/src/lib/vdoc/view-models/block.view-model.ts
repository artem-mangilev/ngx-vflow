import { Subject } from "rxjs";
import { BlockStyleSheet } from "../interfaces/stylesheet.interface";
import { AnyViewModel } from "./any.view-model";
import { Shadow } from "../../shared/interfaces/filter.interface";
import { WritableSignal, signal } from "@angular/core";

export enum BlockEvent {
  hoverIn,
  hoverOut,

  focusIn,
  focusOut,

  dynamicStyleAdded,
  dynamicStyleDeleted
}

type BlockEventData = { event: BlockEvent, payload?: unknown }

export abstract class BlockViewModel extends AnyViewModel {
  public width = signal(0)
  public height = signal(0)
  public x = signal(0)
  public y = signal(0)

  // TODO provide some default value
  public filter = signal<Shadow | null>(null);

  public abstract override styleSheet: Required<BlockStyleSheet>

  private _blockEvent$ = new Subject<BlockEventData>()

  public abstract applyStyles(styles: BlockStyleSheet): void

  public triggerBlockEvent(event: BlockEvent, payload?: unknown) {
    this._blockEvent$.next({ event, payload })
  }

  calculateLayout() {
    // we need to know layout of children before we compute parent layout
    this.children.forEach(c => c.calculateLayout())

    this.calculateHeight()
    this.calculateWidth()
    this.calculatePosition()
  }

  public setHeight(height: number) {
    // TODO prob bad idea to mutate styleSheet instance
    (this.styleSheet.height as WritableSignal<number>).set(height);
  }

  protected calculatePosition() {
    // TODO maybe override parent in this class, because block always have parent
    if (!this.parent) return

    // Compute y
    let y = 0
    y += this.styleSheet.marginTop()
    // Current block rendered based on it's prev sibling
    const prevSibling = this.parent.children[this.parent.children.indexOf(this) - 1]
    if (prevSibling && prevSibling instanceof BlockViewModel) {
      y += prevSibling.y() + prevSibling.height() + prevSibling.styleSheet.marginBottom()
    }

    // Compute x
    let x = 0
    if (
      // Both horizontal margins are auto
      this.styleSheet.marginLeft() === 'auto' &&
      this.styleSheet.marginRight() === 'auto'
    ) {
      const parentWidth = getModelWidth(this.parent!)

      x = (parentWidth / 2) - (this.width() / 2)
    } else if (
      // Both horizontal margins are absolute values
      typeof this.styleSheet.marginLeft() === 'number' &&
      typeof this.styleSheet.marginRight() === 'number'
    ) {
      x += this.styleSheet.marginLeft() as number
    } else {
      // TODO unhandled
      x = 0
    }

    this.x.set(x)
    this.y.set(y)
  }

  /**
   * Set height for view
   */
  protected calculateHeight() {
    // TODO truthy value
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

  /**
   * Set width for view
   */
  protected calculateWidth() {
    this.width.set(getModelWidth(this))
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
 * Get array of nodes from root to targetModel
 *
 * @param targetModel model to trace to
 * @returns nodes array
 */
function traceFromRoot(targetModel: AnyViewModel): AnyViewModel[] {
  const chain: AnyViewModel[] = []

  let current: AnyViewModel | null = targetModel
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
  const chainFromRoot = traceFromRoot(model)

  // TODO move this logic inside loop
  const [root] = chainFromRoot
  let width = root.width();

  chainFromRoot
    .filter(isBlock)
    .forEach(item => {
      // we know width either from styles
      // TODO truthy value
      if (item.styleSheet.width()) {
        width = item.styleSheet.width()
      } else {
        // or if styles has no width, we compute it from margins
        if (typeof item.styleSheet.marginLeft() === 'number') {
          width -= item.styleSheet.marginLeft() as number
        }

        if (typeof item.styleSheet.marginRight() === 'number') {
          width -= item.styleSheet.marginRight() as number
        }
      }
    })

  return width
}

export function styleSheetWithDefaults(styles: BlockStyleSheet): Required<BlockStyleSheet> {
  return {
    width: styles.width ?? signal(0),
    height: styles.height ?? signal(0),
    marginLeft: styles.marginLeft ?? signal(0),
    marginRight: styles.marginRight ?? signal(0),
    marginBottom: styles.marginBottom ?? signal(0),
    marginTop: styles.marginTop ?? signal(0),
    boxShadow: styles.boxShadow ?? signal(null),
    onHover: styles.onHover ?? null,
    onFocus: styles.onFocus ?? null,
    onClass: styles.onClass ?? []
  }
}
