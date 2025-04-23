import { computed, Injectable, signal } from '@angular/core';
import { ToolbarModel } from '../models/toolbar.model';
import { NodeModel } from '../models/node.model';
import { Microtask } from '../decorators/microtask.decorator';

@Injectable()
export class OverlaysService {
  private readonly toolbars = signal<ToolbarModel[]>([]);

  public nodeToolbarsMap = computed(() => {
    const map = new Map<NodeModel, ToolbarModel[]>();

    this.toolbars().forEach((toolbar) => {
      const existing = map.get(toolbar.node) ?? [];
      map.set(toolbar.node, [...existing, toolbar]);
    });

    return map;
  });

  @Microtask
  public addToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => [...toolbars, toolbar]);
  }

  @Microtask
  public removeToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => toolbars.filter((t) => t !== toolbar));
  }
}
