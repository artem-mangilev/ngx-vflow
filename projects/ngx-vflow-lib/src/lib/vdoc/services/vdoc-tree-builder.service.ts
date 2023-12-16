import { Injectable } from '@angular/core';
import { VDocViewComponent } from '../components/vdoc-view/vdoc-view.component';
import { AnyViewModel } from '../view-models/any.view-model';
import { RootViewModel } from '../view-models/root.view-model';

// TODO probably should rename
@Injectable()
export class VDocTreeBuilderService {
  public root: RootViewModel | null = null

  private componentMap = new Map<VDocViewComponent, AnyViewModel>()

  register(model: AnyViewModel) {
    this.componentMap.set(model.component, model);

    if (model instanceof RootViewModel) {
      this.root = model;
    }
  }

  getByComponent(component: VDocViewComponent): AnyViewModel {
    return this.componentMap.get(component)!;
  }

  /**
   * Recalculate layout starting from root
   */
  calculateLayout() {
    this.root?.calculateLayout();
  }
}
