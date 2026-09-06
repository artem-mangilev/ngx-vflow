import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  Injector,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { EdgeModel } from '../../models/edge.model';
import { EdgeContext } from '../../interfaces/template-context.interface';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { HandleModel } from '../../models/handle.model';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { PointerDirective } from '../../directives/pointer.directive';

@Component({
  selector: 'svg[edge]',
  templateUrl: './edge.component.html',
  styleUrls: ['./edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
    class: 'selectable',
  },
  imports: [NgTemplateOutlet, PointerDirective],
})
export class EdgeComponent {
  protected injector = inject(Injector);
  private selectionService = inject(SelectionService);
  private flowSettingsService = inject(FlowSettingsService);
  private edgeRenderingService = inject(EdgeRenderingService);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective, { optional: true });

  public model = input.required<EdgeModel>();

  public edgeTemplate = input<TemplateRef<EdgeContext>>();

  constructor() {
    const element = inject<ElementRef<SVGElement>>(ElementRef).nativeElement;
    effect(() => {
      element.style.visibility = !this.model().isReady() || this.model().reconnecting() ? 'hidden' : 'visible';
    });
    effect(() => {
      element.style.zIndex = String(this.model().renderOrder());
    });
  }

  public select() {
    if (this.model().selectable()) {
      this.selectionService.select(this.model());
    }
  }

  public pull() {
    if (this.flowSettingsService.elevateEdgesOnSelect()) {
      this.edgeRenderingService.pull(this.model());
    }
  }

  protected startReconnection(event: Event, handle: HandleModel) {
    // ignore drag by stopping propagation
    event.stopPropagation();

    this.connectionController?.startReconnection(handle, this.model(), event);
  }
}
