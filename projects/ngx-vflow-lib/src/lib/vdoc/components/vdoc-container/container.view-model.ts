import { Signal, ViewContainerRef, computed, effect, inject, signal } from "@angular/core";
import { VDocViewComponent } from "../vdoc-view/vdoc-view.component";
import { ContainerStyleSheet } from "../../interfaces/stylesheet.interface";
import { BlockViewModel } from "../../view-models/block.view-model";
import { styleSheetWithDefaults as blockStyleSheetWithDefaults } from "../../view-models/block.view-model";

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

  public borderRadius = computed(() => this.styleSheet.borderRadius())
  public borderWidth = computed(() => this.styleSheet.borderWidth())
  public borderColor = computed(() => this.styleSheet.borderColor())
  public backgroundColor = computed(() => this.styleSheet.backgroundColor())

  public styleSheet: Required<ContainerStyleSheet>

  constructor(styleSheet: ContainerStyleSheet) {
    super()

    this.styleSheet = styleSheetWithDefaults(styleSheet)
  }
}

function styleSheetWithDefaults(styles: ContainerStyleSheet): Required<ContainerStyleSheet> {
  return {
    ...blockStyleSheetWithDefaults(styles),
    backgroundColor: styles.backgroundColor ?? signal(''),
    borderColor: styles.borderColor ?? signal(''),
    borderWidth: styles.borderWidth ?? signal(0),
    borderRadius: styles.borderRadius ?? signal(0),
    animation: styles.animation ?? {},
  }
}

