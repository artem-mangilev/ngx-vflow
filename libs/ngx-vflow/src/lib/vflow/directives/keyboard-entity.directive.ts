import { Directive, ElementRef, computed, inject, input } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { KeyboardLabelsService } from '../services/keyboard-labels.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { ViewportService } from '../services/viewport.service';
import { getViewportBounds, getViewportForBounds } from '../utils/viewport';
import { getNodesFlowBounds } from '../utils/nodes';
import { getOverlappingArea } from '../utils/rect';

/**
 * One entity as a Tab stop: its focusability, the description read out with it, and the pan that brings a node back
 * into view when focus reaches it offscreen. The commands themselves are dispatched by the graph container.
 */
@Directive({
  selector: '[vflowKeyboardEntity]',
  host: {
    '[attr.tabindex]': 'vflowKeyboardEntity().focusable() ? 0 : -1',
    '(focus)': 'onFocus()',
  },
})
export class KeyboardEntityDirective {
  public vflowKeyboardEntity = input.required<NodeModel | EdgeModel>();
  public element = inject<ElementRef<HTMLElement | SVGElement>>(ElementRef).nativeElement;
  private keyboardLabels = inject(KeyboardLabelsService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);

  public description = computed(() => {
    const model = this.vflowKeyboardEntity();
    if (!model.focusable() || this.element.closest('[data-vflow-no-keyboard]')) return '';
    const labels = this.settings.ariaLabels();
    const node = model instanceof NodeModel;
    return this.keyboardLabels.text(node ? labels.nodeInstructions : labels.edgeInstructions, {
      selectable: this.settings.selectionMode() !== 'manual' && model.selectable(),
      // Movement needs a selected node: promise it only where the keys, or the application, can select it.
      movable: node && model.draggable() && (model.selectable() || model.selected()),
    });
  });

  protected onFocus() {
    const model = this.vflowKeyboardEntity();
    if (
      !(model instanceof NodeModel) ||
      !model.focusable() ||
      !this.settings.autoPanOnNodeFocus() ||
      !this.element.matches(':focus-visible') ||
      this.element.closest('[data-vflow-no-keyboard]')
    )
      return;
    const bounds = getNodesFlowBounds([model]);
    const width = this.settings.computedFlowWidth();
    const height = this.settings.computedFlowHeight();
    const viewport = this.viewport.readableViewport();
    if (
      width <= 0 ||
      height <= 0 ||
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      getOverlappingArea(bounds, getViewportBounds(viewport, width, height)) > 0
    )
      return;
    this.viewport.writableViewport.set({
      changeType: 'absolute',
      state: getViewportForBounds(bounds, width, height, viewport.zoom, viewport.zoom, 0),
      duration: 0,
    });
  }
}
