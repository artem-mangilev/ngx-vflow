import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { HandleService } from '../../services/handle.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { NgTemplateOutlet, NgComponentOutlet, AsyncPipe } from '@angular/common';

import { NodeHandlesControllerDirective } from '../../directives/node-handles-controller.directive';
import { NodeResizeControllerDirective } from '../../directives/node-resize-controller.directive';

export type HandleState = 'valid' | 'invalid' | 'idle';

@Component({
  selector: 'div[node]',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService, NodeAccessorService],
  host: {
    class: 'vflow-node',
    '[class.vflow-node--undraggable]': 'hostUndraggable()',
    '[class.vflow-node--drag-handles-only]': 'hostDragHandlesOnly()',
    '(focusin)': 'model().focused.set(true)',
    '(focusout)': 'model().focused.set(false)',
  },
  imports: [
    NgTemplateOutlet,
    NgComponentOutlet,
    NodeHandlesControllerDirective,
    NodeResizeControllerDirective,
    AsyncPipe,
  ],
})
export class NodeComponent implements OnInit, OnDestroy {
  protected injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private nodeAccessor = inject(NodeAccessorService);

  public model = input.required<NodeModel>();

  protected readonly hostUndraggable = computed(() => !this.model().draggable());

  protected readonly hostDragHandlesOnly = computed(
    () => this.model().draggable() && this.model().dragHandlesCount() > 0,
  );

  public nodeTemplate = input<TemplateRef<any>>();

  public groupNodeTemplate = input<TemplateRef<any>>();

  constructor() {
    effect(() => {
      this.hostRef.nativeElement.style.visibility = this.model().isReady() ? 'visible' : 'hidden';
      this.hostRef.nativeElement.classList.toggle(
        'vflow-node-selected',
        this.model().selected() || this.model().preselected(),
      );
    });
    effect(() => {
      const model = this.model();
      const groups = this.flowSettingsService.optimization().detachedGroupsLayer
        ? this.nodeRenderingService.groups()
        : [];
      const groupIndex = groups.indexOf(model);
      this.hostRef.nativeElement.style.zIndex = String(
        groupIndex >= 0 ? groupIndex - groups.length : model.renderOrder(),
      );
    });
    effect(() => {
      // Position updates belong to this node, not the enclosing graph list.
      this.hostRef.nativeElement.style.transform = this.model().pointTransformCss();
    });
  }

  public ngOnInit() {
    // Nodes whose size is content-driven (html-template / component) are measured
    // by nodeResizeController; until then they stay hidden. Other node types have
    // explicit dimensions and are considered measured immediately.
    const type = this.model().rawNode.type;
    // A remounted custom view must measure its new DOM before becoming visible.
    this.model().isMeasured.set(type !== 'html-template' && !this.model().isComponentType);

    this.nodeAccessor.model.set(this.model());
    this.handleService.node.set(this.model());
    this.model().nodeElement.set(this.hostRef.nativeElement);

    let wasCulled = false;
    effect(
      () => {
        const model = this.model();
        const culled = model.culled();
        if (wasCulled && !culled) {
          // Restore layout hidden, then refresh dimensions and handles before painting.
          untracked(() => {
            model.isMeasured.set(type !== 'html-template' && !model.isComponentType);
            model.handles().forEach((handle) => handle.isMeasured.set(false));
          });
        }
        wasCulled = culled;
      },
      { injector: this.injector },
    );

    effect(
      () => {
        if (this.model().draggable()) {
          this.draggableService.enable(this.hostRef.nativeElement, this.model());
        } else {
          this.draggableService.disable(this.hostRef.nativeElement);
        }
      },
      { injector: this.injector },
    );
  }

  public ngOnDestroy(): void {
    this.model().nodeElement.set(null);

    this.draggableService.destroy(this.hostRef.nativeElement);
  }

  protected pullNode() {
    if (this.flowSettingsService.elevateNodesOnSelect()) {
      this.nodeRenderingService.pullNode(this.model());
    }
  }
}
