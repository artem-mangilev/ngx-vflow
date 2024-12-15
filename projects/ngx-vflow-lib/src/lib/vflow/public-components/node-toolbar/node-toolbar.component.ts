import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  input,
  viewChild,
} from '@angular/core';
import { Directive } from '@angular/core';
import { Position } from '../../types/position.type';
import { ToolbarModel } from '../../models/toolbar.model';
import { OverlaysService } from '../../services/overlays.service';
import { NodeAccessorService } from '../../services/node-accessor.service';

@Component({
  selector: 'node-toolbar',
  template: `
    <ng-template #toolbar>
      <div class="wrapper" nodeToolbarWrapper [model]="model">
        <ng-content />
      </div>
    </ng-template>
  `,
  styles: [
    `
      .wrapper {
        width: max-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeToolbarComponent implements OnInit, OnDestroy {
  private overlaysService = inject(OverlaysService);
  private nodeService = inject(NodeAccessorService);

  @Input()
  public set position(value: Position) {
    this.model.position.set(value);
  }

  public toolbarContentTemplate = viewChild.required<TemplateRef<unknown>>('toolbar');

  protected model = new ToolbarModel(this.nodeService.model()!);

  public ngOnInit(): void {
    this.model.template.set(this.toolbarContentTemplate());

    this.overlaysService.addToolbar(this.model);
  }

  public ngOnDestroy(): void {
    this.overlaysService.removeToolbar(this.model);
  }
}

@Directive({ selector: '[nodeToolbarWrapper]' })
export class NodeToolbarWrapperDirective implements OnInit {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);

  public model = input.required<ToolbarModel>();

  public ngOnInit(): void {
    this.model().size.set({
      width: this.element.nativeElement.clientWidth,
      height: this.element.nativeElement.clientHeight,
    });
  }
}
