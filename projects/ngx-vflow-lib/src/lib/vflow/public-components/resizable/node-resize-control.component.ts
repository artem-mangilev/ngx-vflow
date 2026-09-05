import { NoDragDirective } from '../../directives/gesture-exclusions.directive';
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
  hostDirectives: [NoDragDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'resize-control',
    '[class.top]': "position().includes('top')",
    '[class.right]': "position().includes('right')",
    '[class.bottom]': "position().includes('bottom')",
    '[class.left]': "position().includes('left')",
    '[class.line]': 'isLine()',
    '[class.handle]': '!isLine()',
    '[style.scale]': 'scale()',
    '[style.background-color]': 'backgroundColor()',
    '[style.border-color]': 'borderColor()',
  },
})
export class NodeResizeControlComponent implements OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private viewportService = inject(ViewportService);
  private settingsService = inject(FlowSettingsService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  public position = input.required<ControlPosition>();
  public variant = input<ResizeControlVariant>(ResizeControlVariant.Handle);
  public color = input<string>();
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

  protected backgroundColor = computed(() => (this.isLine() ? null : (this.color() ?? null)));
  protected borderColor = computed(() => (this.isLine() ? (this.color() ?? null) : null));

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
      paneDomNode: this.hostRef.nativeElement.closest('.vflow-pane'),
    }),
    onChange: (change, childChanges) => {
      const model = this.model;

      if (!model.resizing()) {
        model.resizing.set(true);
      }

      if (change.x !== undefined && change.y !== undefined) {
        model.setPoint({ x: change.x, y: change.y });
      }

      if (change.width !== undefined) {
        model.width.set(change.width);
      }

      if (change.height !== undefined) {
        model.height.set(change.height);
      }

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
