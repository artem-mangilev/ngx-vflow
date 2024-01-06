import { ChangeDetectorRef, Directive, Input, OnInit, Signal, ViewRef, inject, signal } from "@angular/core";
import { AnyViewModel } from "../../view-models/any.view-model";
import { VDocTreeBuilderService } from "../../services/vdoc-tree-builder.service";
import { StyleSheet } from '../../interfaces/stylesheet.interface'
import { UISnapshot } from "../../utils/ui-change";
import { Subscription } from "rxjs";

@Directive()
export abstract class VDocViewComponent<T extends AnyViewModel = AnyViewModel, U extends StyleSheet = StyleSheet> implements OnInit {
  @Input('styleSheet')
  public styleSheetFunction?: (snapshot: Signal<UISnapshot>) => U

  protected model!: T

  protected treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  protected parent: VDocViewComponent | null = inject(VDocViewComponent, {
    optional: true,
    skipSelf: true
  })

  protected styleSheet!: U

  protected uiSnapshot = signal<UISnapshot>({ classes: new Set() })

  protected subscription = new Subscription()

  protected viewRef = inject(ChangeDetectorRef) as ViewRef

  protected abstract modelFactory(): T

  protected abstract defaultStyleSheet(): U

  public ngOnInit(): void {
    this.styleSheet = this.styleSheetFunction
      ? this.styleSheetFunction(this.uiSnapshot)
      : this.defaultStyleSheet()

    this.model = this.createModel();

    this.viewRef.onDestroy(() => this.subscription.unsubscribe())
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
