import { Signal, computed, signal } from "@angular/core";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "./block.view-model";

export class ContainerViewModel extends BlockViewModel {
  // rect height is increased by borderWidth if it applied, so we need decrease
  // it by this value in order to fit into parent element
  public contentHeight = computed(() => this.height() - this.styleSheet.borderWidth())

  // rect width is increased by borderWidth if it applied, so we need decrease
  // it back by this value in order to fit into parent element
  public contentWidth = computed(() => this.width() - this.styleSheet.borderWidth())

  // TODO explain this logic, may lead to bugs
  public contentX = computed(() => this.styleSheet.borderWidth() / 2)
  public contentY = computed(() => this.styleSheet.borderWidth() / 2)

  public borderRadius: Signal<number>
  public borderWidth: Signal<number>
  public borderColor: Signal<string>
  public backgroundColor: Signal<string>

  public styleSheet: Required<ContainerStyleSheet>;

  constructor(
    public component: VDocViewComponent,
    styleSheet: ContainerStyleSheet
  ) {
    super();

    this.styleSheet = styleSheetWithDefaults(styleSheet)

    // TODO check if I could move it outside constuctor (as computed)
    this.borderColor = this.styleSheet.borderColor
    this.borderRadius = this.styleSheet.borderRadius
    this.borderWidth = this.styleSheet.borderWidth
    this.backgroundColor = this.styleSheet.backgroundColor

    this.applyStyles(this.styleSheet)

    super.init()
  }

  public applyStyles(styles: ContainerStyleSheet): void {
    this.filter.set(styles.boxShadow ? styles.boxShadow() : null)
  }
}

function styleSheetWithDefaults(styles: ContainerStyleSheet): Required<ContainerStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles),
    backgroundColor: styles.backgroundColor ?? signal(''),
    borderColor: styles.borderColor ?? signal(''),
    borderWidth: styles.borderWidth ?? signal(0),
    borderRadius: styles.borderRadius ?? signal(0),
    animation: styles.animation ?? signal([]),
  }
}

