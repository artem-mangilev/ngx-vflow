import { Directive, inject } from "@angular/core";
import { AnyViewModel } from "../../view-models/any.view-model";
import { VDocTreeBuilderService } from "../../services/vdoc-tree-builder.service";

@Directive()
export abstract class VDocViewComponent {
  protected abstract model: AnyViewModel

  protected abstract modelFactory(): AnyViewModel

  protected treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  protected parent: VDocViewComponent | null = inject(VDocViewComponent, {
    optional: true,
    skipSelf: true
  })

  protected createModel<T extends AnyViewModel>(): T {
    const model = this.modelFactory() as T

    const parent = this.treeManager.getByComponent(this.parent!)
    if (parent) {
      model.parent = parent;
      parent.children.push(model)
    }

    this.treeManager.register(model)

    return model
  }
}
