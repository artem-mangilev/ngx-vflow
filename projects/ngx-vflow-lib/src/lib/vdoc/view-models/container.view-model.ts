import { signal } from "@angular/core";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";

export class ContainerViewModel extends BlockViewModel {
  public contentHeight = 0
  public contentWidth = 0
  public contentX = 0
  public contentY = 0
  public borderRadius = signal(0)
  public borderColor = signal('')
  public borderWidth = signal(0)
  public backgroundColor = signal('')

  public styleSheet: Required<ContainerStyleSheet>;

  constructor(
    public component: VDocViewComponent,
    styleSheet: ContainerStyleSheet
  ) {
    super();

    this.styleSheet = styleSheetWithDefaults(styleSheet)

    this.applyStyles(this.styleSheet)

    super.init()
  }

  public applyStyles(styles: ContainerStyleSheet): void {
    if (styles.borderColor?.()) {
      this.borderColor.set(styles.borderColor())
    }

    if (styles.borderRadius?.()) {
      this.borderRadius.set(styles.borderRadius())
    }

    if (styles.borderWidth?.()) {
      this.borderWidth.set(styles.borderWidth())

      // TODO respect parent container (now it overlaps parent container)
    }

    if (styles.backgroundColor?.()) {
      this.backgroundColor.set(styles.backgroundColor())
    }

    this.filter.set(styles.boxShadow ? styles.boxShadow() : null)

    this.updateView()
  }

  protected override calculateHeight(): void {
    super.calculateHeight()

    // rect height is increased by borderWidth if it applied, so we need decrease
    // it by this value in order to fit into parent element
    this.contentHeight = this.height() - this.styleSheet.borderWidth()
  }

  protected override calculateWidth(): void {
    super.calculateWidth()

    // rect width is increased by borderWidth if it applied, so we need decrease
    // it back by this value in order to fit into parent element
    this.contentWidth = this.width() - this.styleSheet.borderWidth()
  }

  protected override calculatePosition(): void {
    super.calculatePosition()

    // TODO explain this logic
    this.contentX = this.styleSheet.borderWidth() / 2
    this.contentY = this.styleSheet.borderWidth() / 2
  }
}

function styleSheetWithDefaults(styles: ContainerStyleSheet): Required<ContainerStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles),
    backgroundColor: styles.backgroundColor ?? signal(''),
    borderColor: styles.borderColor ?? signal(''),
    borderWidth: styles.borderWidth ?? signal(0),
    borderRadius: styles.borderRadius ?? signal(0),
    animation: styles.animation ?? null,
  }
}

