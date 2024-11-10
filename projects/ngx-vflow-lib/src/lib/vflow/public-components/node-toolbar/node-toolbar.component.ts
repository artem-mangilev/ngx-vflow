import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, inject, Input, OnDestroy } from '@angular/core';
import { Position } from '../../types/position.type';
import { ToolbarTemplateDirective } from '../../directives/template.directive';
import { ToolbarModel } from '../../models/toolbar.model';
import { OverlaysService } from '../../services/overlays.service';
import { NodeAccessorService } from '../../services/node-accessor.service';

@Component({
  selector: 'node-toolbar',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeToolbarComponent implements AfterContentInit, OnDestroy {
  private overlaysService = inject(OverlaysService);
  private nodeService = inject(NodeAccessorService)

  @Input()
  public set visible(value: boolean) {
    this.model.visible.set(value);
  };

  @Input()
  public set position(value: Position) {
    this.model.position.set(value);
  }

  @ContentChild(ToolbarTemplateDirective)
  public toolbarContentTemplate!: ToolbarTemplateDirective

  public model = new ToolbarModel(this.nodeService.model()!)

  public ngAfterContentInit(): void {
    if (this.toolbarContentTemplate.templateRef) {
      this.model.template.set(this.toolbarContentTemplate.templateRef)

      this.overlaysService.addToolbar(this.model)
    }
  }

  public ngOnDestroy(): void {
    this.overlaysService.removeToolbar(this.model)
  }
}
