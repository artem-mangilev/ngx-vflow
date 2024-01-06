import { Directive, Input, OnInit, inject } from "@angular/core";
import { AnyViewModel } from "../../view-models/any.view-model";
import { VDocTreeBuilderService } from "../../services/vdoc-tree-builder.service";
import { StyleSheet } from '../../interfaces/stylesheet.interface'

@Directive()
export abstract class VDocViewComponent<T extends AnyViewModel = AnyViewModel, U extends StyleSheet = StyleSheet> implements OnInit {
  @Input('styleSheet')
  public styleSheetFunction?: () => U

  protected model!: T

  protected treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  protected parent: VDocViewComponent | null = inject(VDocViewComponent, {
    optional: true,
    skipSelf: true
  })

  protected styleSheet!: U

  protected abstract modelFactory(): T

  protected abstract defaultStyleSheet(): U

  public ngOnInit(): void {
    this.styleSheet = this.styleSheetFunction ? this.styleSheetFunction() : this.defaultStyleSheet()
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
