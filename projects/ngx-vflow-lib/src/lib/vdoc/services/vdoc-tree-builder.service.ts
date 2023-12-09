import { Injectable } from '@angular/core';
import { BlockViewModel } from '../view-models/block.view-model';
import { VDocViewComponent } from '../components/vdoc-view/vdoc-view.component';
import { AnyViewModel } from '../view-models/any.view-model';
import { RootViewModel } from '../view-models/root.view-model';

// TODO probably should rename
@Injectable()
export class VDocTreeBuilderService {
  private root: RootViewModel | null = null

  private componentMap = new Map<VDocViewComponent, AnyViewModel>()

  register(model: AnyViewModel) {
    this.componentMap.set(model.component, model);

    if (model instanceof BlockViewModel) {
      model.calculateLayout()
    } else if (model instanceof RootViewModel) {
      this.root = model;
    }
  }

  getByComponent(component: VDocViewComponent): AnyViewModel {
    return this.componentMap.get(component)!;
  }
}
