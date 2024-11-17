import { computed, Injectable, signal } from '@angular/core';
import { ToolbarModel } from '../models/toolbar.model';
import { NodeModel } from '../models/node.model';
import { Microtask } from '../decorators/microtask.decorator';

@Injectable()
export class OverlaysService {
  private toolbars = signal<ToolbarModel[]>([]);

  public nodeToolbars = computed(() => {
    const map = new Map<NodeModel, ToolbarModel>()

    this.toolbars().forEach((toolbar) => {
      map.set(toolbar.node, toolbar)
    })

    return map
  })

  @Microtask
  public addToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => [...toolbars, toolbar]);
  }

  @Microtask
  public removeToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => toolbars.filter(t => t !== toolbar));
  }
}
