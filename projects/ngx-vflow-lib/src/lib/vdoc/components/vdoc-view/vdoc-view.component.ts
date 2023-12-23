import { Directive, OnInit, inject } from "@angular/core";
import { AnyViewModel } from "../../view-models/any.view-model";
import { VDocTreeBuilderService } from "../../services/vdoc-tree-builder.service";

@Directive()
export abstract class VDocViewComponent<T extends AnyViewModel = AnyViewModel> implements OnInit {
  protected model!: T

  protected treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  protected parent: VDocViewComponent | null = inject(VDocViewComponent, {
    optional: true,
    skipSelf: true
  })

  protected abstract modelFactory(): T

  public ngOnInit(): void {
    this.model = this.createModel();
  }

  protected createModel(): T {
    const model = this.modelFactory()

    const parent = this.treeManager.getByComponent(this.parent!)
    if (parent) {
      model.parent = parent;
      parent.children.push(model)
    }

    this.treeManager.register(model)

    return model
  }
}
