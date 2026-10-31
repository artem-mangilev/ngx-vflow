import { DestroyRef, Directive, inject } from '@angular/core';
import { NODE_MODEL } from '../utils/node-model.token';

@Directive({
  standalone: true,
  selector: '[vDragHandle]',
  host: {
    class: 'v-drag-handle',
  },
})
export class VflowDragHandleDirective {
  constructor() {
    const model = inject(NODE_MODEL);
    model.dragHandlesCount.update((count) => count + 1);

    inject(DestroyRef).onDestroy(() => {
      model.dragHandlesCount.update((count) => count - 1);
    });
  }
}
