import { DestroyRef, Directive, inject } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';

@Directive({
  standalone: true,
  selector: '[vDragHandle]',
  host: {
    class: 'v-drag-handle',
  },
})
export class VflowDragHandleDirective {
  private nodeAccessor = inject(NodeAccessorService);

  private get model() {
    return this.nodeAccessor.model()!;
  }

  constructor() {
    this.model.dragHandlesCount.update((count) => count + 1);

    inject(DestroyRef).onDestroy(() => {
      this.model.dragHandlesCount.update((count) => count - 1);
    });
  }
}
