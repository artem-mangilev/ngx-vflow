import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  input,
  viewChild,
  effect,
  forwardRef,
} from '@angular/core';
import { Directive } from '@angular/core';
import { Position } from '../../types/position.type';
import { ToolbarModel } from '../../models/toolbar.model';
import { OverlaysService } from '../../services/overlays.service';
import { NodeAccessorService } from '../../services/node-accessor.service';

/**
 * Declares a toolbar next to the node presentation this component sits in.
 * The flow renders the content in its toolbar layer; no component styles here,
 * because they would be removed with this component while the flow still owns the rendered content.
 */
@Component({
  selector: 'node-toolbar',
  template: `
    <ng-template #toolbar>
      <div class="wrapper" nodeToolbarWrapper [model]="model">
        <ng-content />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [forwardRef(() => NodeToolbarWrapperDirective)],
})
export class NodeToolbarComponent implements OnInit, OnDestroy {
  private overlaysService = inject(OverlaysService);
  private nodeService = inject(NodeAccessorService);

  public position = input<Position>('top');

  protected toolbarContentTemplate = viewChild.required<TemplateRef<unknown>>('toolbar');

  protected model = new ToolbarModel(this.nodeService.model()!);

  constructor() {
    effect(() => this.model.position.set(this.position()));
  }

  public ngOnInit(): void {
    this.model.template.set(this.toolbarContentTemplate());

    this.overlaysService.addToolbar(this.model);
  }

  public ngOnDestroy(): void {
    this.overlaysService.removeToolbar(this.model);
  }
}

@Directive({
  selector: '[nodeToolbarWrapper]',
  standalone: true,
})
export class NodeToolbarWrapperDirective {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);

  public model = input.required<ToolbarModel>();

  constructor() {
    effect(() => {
      // This template is mounted inside the flow's positioned toolbar container.
      // The transform shifts the box by its own size, so no measurement is needed.
      this.element.nativeElement.parentElement!.style.transform = this.model().transform();
    });
  }
}
