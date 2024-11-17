import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';

@Directive({
  selector: '[dragHandle]',
  host: {
    'class': 'vflow-drag-handle'
  }
})
export class DragHandleDirective {
  private nodeAccessor = inject(NodeAccessorService)

  private get model() {
    return this.nodeAccessor.model()!
  }

  constructor() {
    this.model.dragHandlesCount.update((count) => count + 1)

    inject(DestroyRef).onDestroy(() => {
      this.model.dragHandlesCount.update(count => count - 1)
    })
  }
}
