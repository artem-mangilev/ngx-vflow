import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";

export class ContainerViewModel extends BlockViewModel {
  public contentHeight = 0
  public contentWidth = 0
  public contentX = 0
  public contentY = 0

  public styleSheet: Required<ContainerStyleSheet>;

  constructor(
    public component: VDocViewComponent,
    styleSheet: ContainerStyleSheet
  ) {
    super();

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }

  protected override calculateHeight(): void {
    super.calculateHeight()

    // rect height is increased by borderWidth if it applied, so we need decrease
    // it by this value in order to fit into parent element
    this.contentHeight = this.height - this.styleSheet.borderWidth
  }

  protected override calculateWidth(): void {
    super.calculateWidth()

    // rect width is increased by borderWidth if it applied, so we need decrease
    // it back by this value in order to fit into parent element
    this.contentWidth = this.width - this.styleSheet.borderWidth
  }

  protected override calculatePosition(): void {
    super.calculatePosition()

    this.contentX = this.styleSheet.borderWidth / 2
    this.contentY = this.styleSheet.borderWidth / 2
  }
}

function styleSheetWithDefaults(styles: ContainerStyleSheet): Required<ContainerStyleSheet> {
  return {
    width: styles.width ?? 0,
    height: styles.height ?? 0,
    marginLeft: styles.marginLeft ?? 0,
    marginRight: styles.marginRight ?? 0,
    marginBottom: styles.marginBottom ?? 0,
    marginTop: styles.marginTop ?? 0,
    borderColor: styles.borderColor ?? '',
    borderWidth: styles.borderWidth ?? 0,
    borderRadius: styles.borderRadius ?? 0,
    ...styles
  }
}
