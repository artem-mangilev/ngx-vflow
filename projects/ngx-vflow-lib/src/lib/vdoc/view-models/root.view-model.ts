import { VDocRootComponent } from "../components/vdoc-root/vdoc-root.component";
import { AnyViewModel } from "./any.view-model";

export class RootViewModel extends AnyViewModel {
  constructor(
    public component: VDocRootComponent
  ) {
    super()
  }

  public calculateLayout(): void {
    this.children.forEach(c => c.calculateLayout())
  }
}
