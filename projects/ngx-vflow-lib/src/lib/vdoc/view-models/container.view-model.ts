import { VDocBlockComponent } from "../components/vdoc-block/vdoc-block.component";
import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel, isBlock } from "./block.view-model";

export class ContainerViewModel extends BlockViewModel {
  public readonly styleSheet: Required<ContainerStyleSheet>;

  constructor(
    public readonly component: VDocBlockComponent,
    styleSheet: ContainerStyleSheet
  ) {
    super();

    this.styleSheet = styleSheetWithDefaults(styleSheet)
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
    ...styles
  }
}
