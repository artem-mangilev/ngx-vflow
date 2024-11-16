import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { NodeAccessorService } from '../services/node-accessor.service';

@Directive({ selector: '[dragHandle]' })
export class DragHandleDirective {
  private handleElement = inject<ElementRef<Element>>(ElementRef).nativeElement
  private nodeAccessor = inject(NodeAccessorService)

  private get model() {
    return this.nodeAccessor.model()!
  }

  constructor() {
    this.model.dragHandles.update(
      elements => [...elements, this.handleElement]
    )

    inject(DestroyRef).onDestroy(() => {
      this.model.dragHandles.update(
        elements => elements.filter(element => element !== this.handleElement)
      )
    })
  }
}
