import { VflowNoDragDirective } from '../../directives/gesture-exclusions.directive';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { ViewportService } from '../../services/viewport.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ResizerInstance, createResizer } from './resizer';
import {
  ControlPosition,
  OnResize,
  OnResizeEnd,
  OnResizeStart,
  ResizeControlDirection,
  ResizeControlVariant,
  ShouldResize,
} from './resizer-types';

/**
 * Single resize control (a line or a corner handle) attached to a node.
 * Positioned purely via CSS classes derived from its {@link ControlPosition}.
 */
@Component({
  selector: '[nodeResizeControl]',
  standalone: true,
  template: '',
  hostDirectives: [VflowNoDragDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'v-resize-control',
    '[class.v-resize-control--top]': "position().includes('top')",
    '[class.v-resize-control--right]': "position().includes('right')",
    '[class.v-resize-control--bottom]': "position().includes('bottom')",
    '[class.v-resize-control--left]': "position().includes('left')",
    '[class.v-resize-control--line]': 'isLine()',
    '[class.v-resize-control--handle]': '!isLine()',
    '[style.scale]': 'scale()',
  },
})
export class NodeResizeControlComponent implements OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private viewportService = inject(ViewportService);
  private settingsService = inject(FlowSettingsService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  public position = input.required<ControlPosition>();
  public variant = input<ResizeControlVariant>(ResizeControlVariant.Handle);
  public minWidth = input(0);
  public minHeight = input(0);
  public maxWidth = input(Infinity);
  public maxHeight = input(Infinity);
  public keepAspectRatio = input(false);
  public resizeDirection = input<ResizeControlDirection>();
  public autoScale = input(true);

  public onResizeStart = input<OnResizeStart>();
  public onResize = input<OnResize>();
  public onResizeEnd = input<OnResizeEnd>();
  public shouldResize = input<ShouldResize>();

  protected isLine = computed(() => this.variant() === ResizeControlVariant.Line);

  private drivenAxes = computed(() => {
    const position = this.position();
    const direction = this.resizeDirection();
    return {
      width: (position.includes('left') || position.includes('right')) && direction !== 'vertical',
      height: (position.includes('top') || position.includes('bottom')) && direction !== 'horizontal',
    };
  });

  /**
   * Handle controls keep a constant on-screen size by counter-scaling against the zoom.
   */
  protected scale = computed(() => {
    if (this.isLine() || !this.autoScale()) {
      return null;
    }

    const zoom = this.viewportService.readableViewport().zoom;
    return `${Math.max(1 / zoom, 1)}`;
  });

  private get model() {
    return this.nodeAccessor.model()!;
  }

  private resizer: ResizerInstance = createResizer({
    domNode: this.hostRef.nativeElement,
    getStoreItems: () => ({
      model: this.model,
      viewport: this.viewportService.readableViewport(),
      snapGrid: this.settingsService.snapGrid(),
      nodeOrigin: [0, 0],
      paneDomNode: this.hostRef.nativeElement.closest('.v-pane'),
    }),
    onChange: (change, childChanges) => {
      const model = this.model;

      if (!model.resizing()) {
        model.resizing.set(true);
      }

      if (change.x !== undefined && change.y !== undefined) {
        model.setPoint({ x: change.x, y: change.y });
      }

      // The engine reports both axes; an axis becomes explicit only when this control drives it or its value
      // changed (aspect ratio), so a side control leaves the other axis following the content.
      const { width: drivesWidth, height: drivesHeight } = this.drivenAxes();
      model.setExplicitSize({
        width: change.width !== undefined && (drivesWidth || change.width !== model.width()) ? change.width : undefined,
        height:
          change.height !== undefined && (drivesHeight || change.height !== model.height()) ? change.height : undefined,
      });

      for (const childChange of childChanges) {
        childChange.model.setPoint(childChange.position);
      }
    },
    onEnd: () => this.model.resizing.set(false),
  });

  constructor() {
    effect(() => {
      this.resizer.update({
        controlPosition: this.position(),
        boundaries: {
          minWidth: this.minWidth(),
          minHeight: this.minHeight(),
          maxWidth: this.maxWidth(),
          maxHeight: this.maxHeight(),
        },
        keepAspectRatio: this.keepAspectRatio(),
        resizeDirection: this.resizeDirection(),
        onResizeStart: this.onResizeStart(),
        onResize: this.onResize(),
        onResizeEnd: this.onResizeEnd(),
        shouldResize: this.shouldResize(),
      });
    });
  }

  public ngOnDestroy(): void {
    this.resizer.destroy();
  }
}
