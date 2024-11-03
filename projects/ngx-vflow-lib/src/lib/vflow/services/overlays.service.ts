import { computed, Injectable, signal } from '@angular/core';
import { ToolbarModel } from '../models/toolbar.model';

@Injectable()
export class OverlaysService {
  public toolbars = signal<ToolbarModel[]>([]);

  public visibleToolbars = computed(() => this.toolbars().filter(t => t.visible()));

  public addToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => [...toolbars, toolbar]);
  }

  public removeToolbar(toolbar: ToolbarModel): void {
    this.toolbars.update((toolbars) => toolbars.filter(t => t !== toolbar));
  }
}
