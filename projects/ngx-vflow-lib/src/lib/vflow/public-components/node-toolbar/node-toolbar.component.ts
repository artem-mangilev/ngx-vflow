import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Position } from '../../types/position.type';
import { ToolbarTemplateDirective } from '../../directives/template.directive';
import { ToolbarModel } from '../../models/toolbar.model';
import { OverlaysService } from '../../services/overlays.service';

@Component({
  selector: 'node-toolbar',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeToolbarComponent implements AfterContentInit, OnDestroy {
  private overlaysService = inject(OverlaysService);

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

  public model = new ToolbarModel()

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
