import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';
import { NodeModel } from '../../models/node.model';
import { id } from '../../utils/id';

@Component({
  selector: 'minimap',
  templateUrl: './minimap.component.html',
  styleUrls: [`./minimap.component.scss`]
})
export class MinimapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService)

  @ViewChild('minimap', { static: true })
  private minimap!: TemplateRef<unknown>

  protected clipPathId = signal(id())
  protected clipPathUrl = computed(() => `url(#${this.clipPathId()})`)

  public ngOnInit(): void {
    const model = new MinimapModel()
    model.template.set(this.minimap)

    this.entitiesService.minimap.set(model)
  }

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node
  }
}
