import { computed, inject, Injectable, signal } from '@angular/core';
import { ToolbarModel } from '../models/toolbar.model';
import { NodeModel } from '../models/node.model';
import { RequestAnimationFrameBatchingService } from './request-animation-frame-batching.service';

@Injectable()
export class OverlaysService {
  private afService = inject(RequestAnimationFrameBatchingService);

  private readonly toolbars = signal<ToolbarModel[]>([]);

  public nodeToolbarsMap = computed(() => {
    const map = new Map<NodeModel, ToolbarModel[]>();

    this.toolbars().forEach((toolbar) => {
      const existing = map.get(toolbar.node) ?? [];
      map.set(toolbar.node, [...existing, toolbar]);
    });

    return map;
  });

  public addToolbar(toolbar: ToolbarModel): void {
    this.afService.batchAnimationFrame(() => {
      this.toolbars.update((toolbars) => [...toolbars, toolbar]);
    });
  }

  public removeToolbar(toolbar: ToolbarModel): void {
    this.afService.batchAnimationFrame(() => {
      this.toolbars.update((toolbars) => toolbars.filter((t) => t !== toolbar));
    });
  }
}
