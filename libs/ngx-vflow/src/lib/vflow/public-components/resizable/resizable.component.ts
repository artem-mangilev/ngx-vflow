import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  booleanAttribute,
  output,
  viewChild,
} from '@angular/core';
import { NODE_MODEL } from '../../utils/node-model.token';
import { ViewportService } from '../../services/viewport.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { VflowNoDragDirective } from '../../public-directives/gesture-exclusions.directive';
import { PointerTracker, createPointerTracker } from '../../gestures/pointer-drag';
import { Point } from '../../interfaces/point.interface';
import { align } from '../../utils/align-number';
import { ResizeGesture, startResize } from './resizer';
import { ResizeBounds } from './resizer-utils';
import {
  ControlPosition,
  ResizeAxis,
  ResizeChangeEvent,
  ResizeDragEvent,
  ResizeEvent,
  ShouldResize,
} from './resizer-types';

const CONTROL_POSITIONS: ControlPosition[] = [
  'top',
  'right',
  'bottom',
  'left',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

/** The four lines and the four corner handles; `data-v-resize-control` is the kind, `-position` the side or corner. */
const CONTROLS = CONTROL_POSITIONS.map((position) => ({
  position,
  kind: position.includes('-') ? 'handle' : 'line',
}));

/**
 * Adds resize controls (four lines + four corner handles) to a node. A drag on a control resizes the node and moves
 * it when a left or top side is dragged.
 *
 * The host element is the node's sizing box: each `explicit` axis receives the node size as an inline border-box
 * width or height, while an `auto` axis keeps its content size. Put it on the top-level element of the
 * node template so the node box, the controls and the handles describe the same rectangle.
 */
@Component({
  selector: '[vResizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss'],
  imports: [VflowNoDragDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'explicitSize()?.width ?? null',
    '[style.height.px]': 'explicitSize()?.height ?? null',
    // The written size must equal the measured offset size, or every gesture would grow the node by its padding.
    '[style.box-sizing]': "explicitSize() ? 'border-box' : null",
  },
})
export class VflowResizableComponent implements OnInit, OnDestroy {
  private model = inject(NODE_MODEL);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private viewportService = inject(ViewportService);
  private settingsService = inject(FlowSettingsService);
  private spacePointContext = inject(SpacePointContextDirective);

  /** `[vResizable]="false"` hides the controls but keeps the element as the node's sizing box. */
  public readonly vResizable = input(true, { transform: booleanAttribute });

  public gap = input(1.5);

  public minWidth = input<number>();
  public minHeight = input<number>();
  public maxWidth = input<number>();
  public maxHeight = input<number>();

  public keepAspectRatio = input(false);

  /** Restricts resizing to one axis; both axes resize without it. */
  public resizeAxis = input<ResizeAxis>();

  public autoScale = input(true);

  public readonly resizeStart = output<ResizeEvent>();
  // Only `window` fires a native `resize` event, so the name does not collide on an element.
  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly resize = output<ResizeChangeEvent>();
  public readonly resizeEnd = output<ResizeEvent>();
  public shouldResize = input<ShouldResize>();

  protected readonly controls = CONTROLS;

  private resizer = viewChild.required<TemplateRef<unknown>>('resizer');

  protected readonly enabled = this.vResizable;

  /** Counter-scale of the corner handles, so they keep their on-screen size while the viewport zooms out. */
  protected readonly scale = computed(() =>
    this.autoScale() ? Math.max(1 / this.viewportService.readableViewport().zoom, 1) : null,
  );

  /** Explicit axes only; `null` while both axes follow the content. */
  protected readonly explicitSize = computed(() => {
    const width = this.model.explicitWidth();
    const height = this.model.explicitHeight();
    return width === undefined && height === undefined ? null : { width, height };
  });

  private registeredTemplate: TemplateRef<unknown> | null = null;
  private tracker: PointerTracker | null = null;
  private gesture: ResizeGesture | null = null;

  public ngOnInit(): void {
    this.registeredTemplate = this.resizer();
    this.model.resizerTemplate.set(this.registeredTemplate);
  }

  public ngOnDestroy(): void {
    this.tracker?.destroy();
    // A replacement element may already have registered its own controls.
    if (this.model.resizerTemplate() === this.registeredTemplate) {
      this.model.resizerTemplate.set(null);
    }
  }

  /** A press on one of the controls; the controls container is the element the pointer is captured on. */
  protected press(event: PointerEvent): void {
    // Primary button only, no ctrl+click (context menu on macOS)
    if (this.gesture || event.button !== 0 || event.ctrlKey) return;

    const control = (event.target as Element).closest<HTMLElement>('[data-v-resize-control]');
    if (!control) return;

    const position = control.dataset['vResizeControlPosition'] as ControlPosition;
    event.stopPropagation();

    this.tracker?.destroy();
    this.tracker = createPointerTracker(
      {
        capture: true,
        stopCompatibilityEvents: true,
        clickDistance: () => 0,
        onStart: ({ event, point }) => this.start(position, { sourceEvent: event }, point),
        onMove: ({ event, point }) => this.gesture?.move({ sourceEvent: event }, this.toFlowPoint(point)),
        onEnd: ({ event }) => this.finish({ sourceEvent: event }),
        onCancel: ({ event }) => this.finish({ sourceEvent: event }),
      },
      event.currentTarget as Element,
    );
    this.tracker.press(event);
  }

  private start(position: ControlPosition, event: ResizeDragEvent, client: Point): void {
    const node = this.model.rawNode;

    this.gesture = startResize(
      {
        node: this.model,
        position,
        bounds: this.bounds(),
        keepAspectRatio: this.keepAspectRatio(),
        resizeAxis: this.resizeAxis(),
        shouldResize: this.shouldResize(),
        onStart: (_, params) => this.resizeStart.emit({ ...params, node }),
        onResize: (_, params) => this.resize.emit({ ...params, node }),
        onEnd: (_, params) => this.resizeEnd.emit({ ...params, node }),
      },
      event,
      this.toFlowPoint(client),
    );
  }

  private finish(event: ResizeDragEvent): void {
    const gesture = this.gesture;
    this.gesture = null;
    this.tracker = null;
    gesture?.end(event);
  }

  /** The inputs win; the CSS min/max of the element are the fallback, read at the press so a class change counts. */
  private bounds(): ResizeBounds {
    const style = getComputedStyle(this.hostRef.nativeElement);
    const px = (value: string) => +value.replace('px', '');

    return {
      minWidth: this.minWidth() ?? (px(style.minWidth) || 0),
      minHeight: this.minHeight() ?? (px(style.minHeight) || 0),
      maxWidth: this.maxWidth() ?? (px(style.maxWidth) || Infinity),
      maxHeight: this.maxHeight() ?? (px(style.maxHeight) || Infinity),
    };
  }

  /** The pointer in flow units, snapped to the grid. */
  private toFlowPoint(client: Point): Point {
    const point = this.spacePointContext.clientToFlowPosition(client);
    const [snapX, snapY] = this.settingsService.snapGrid();

    return snapX > 1 || snapY > 1 ? { x: align(point.x, snapX), y: align(point.y, snapY) } : point;
  }
}
