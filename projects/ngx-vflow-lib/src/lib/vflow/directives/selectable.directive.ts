import { Directive, HostListener, inject } from '@angular/core';
import { SelectionService } from '../services/selection.service';
import { EdgeComponent } from '../components/edge/edge.component';

@Directive({ selector: '[selectable]' })
export class SelectableDirective {
  private selectionService = inject(SelectionService)
  private hostEdge = inject(EdgeComponent, { optional: true })

  @HostListener('mousedown')
  protected onMousedown() {
    if (this.hostEdge) {
      this.selectionService.select(this.hostEdge.model)
    }
  }
}
