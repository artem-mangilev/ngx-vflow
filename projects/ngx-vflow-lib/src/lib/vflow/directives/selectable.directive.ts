import { Directive, HostListener, inject } from '@angular/core';
import { SelectionService } from '../services/selection.service';
import { EdgeComponent } from '../components/edge/edge.component';

import { FlowEntity } from '../interfaces/flow-entity.interface';
import { NodeComponent } from '../components/node/node.component';
import { FlowSettingsService } from '../services/flow-settings.service';

@Directive({
  standalone: true,
  selector: '[selectable]',
})
export class SelectableDirective {
  private flowSettingsService = inject(FlowSettingsService)
  private selectionService = inject(SelectionService)
  private parentEdge = inject(EdgeComponent, { optional: true })
  private parentNode = inject(NodeComponent, { optional: true })

  @HostListener('mousedown')
  @HostListener('touchstart')
  protected onMousedown() {
    const entity = this.entity()
    if (entity && this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(entity)
    }
  }

  private entity(): FlowEntity | null {
    if (this.parentNode) {
      return this.parentNode.nodeModel()
    } else if (this.parentEdge) {
      return this.parentEdge.model()
    }

    return null
  }
}
