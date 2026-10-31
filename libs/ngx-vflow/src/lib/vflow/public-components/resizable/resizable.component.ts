import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NODE_MODEL } from '../../utils/node-model.token';
import { RequestAnimationFrameBatchingService } from '../../services/request-animation-frame-batching.service';
import { NodeResizeControlComponent } from './node-resize-control.component';
import {
  ControlLinePosition,
  ControlPosition,
  RESIZER_HANDLE_POSITIONS,
  RESIZER_LINE_POSITIONS,
  ResizeAxis,
  ResizeChangeEvent,
  ResizeChangeParams,
  ResizeControlVariant,
  ResizeDragEvent,
  ResizeEvent,
  ResizeParams,
  ShouldResize,
} from './resizer-types';

/**
 * Adds resize controls (four lines + four corner handles) to a node. The controls
 * mutate the node dimensions/position through a pointer-based resize engine.
 *
 * The host element is the node's sizing box: each `explicit` axis receives the node size as an inline border-box
 * width or height, while an `auto` axis keeps its content size. Put it on the top-level element of the
 * node template so the node box, the controls and the handles describe the same rectangle.
 */
@Component({
  selector: '[vResizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss'],
  imports: [NodeResizeControlComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'explicitSize()?.width ?? null',
    '[style.height.px]': 'explicitSize()?.height ?? null',
    // The written size must equal the measured offset size, or every gesture would grow the node by its padding.
    '[style.box-sizing]': "explicitSize() ? 'border-box' : null",
  },
})
export class VflowResizableComponent implements OnInit, AfterViewInit, OnDestroy {
  private model = inject(NODE_MODEL);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private afService = inject(RequestAnimationFrameBatchingService);

  public vResizable = input<boolean | ''>();

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

  protected readonly linePositions: ControlLinePosition[] = RESIZER_LINE_POSITIONS;
  protected readonly handlePositions: ControlPosition[] = RESIZER_HANDLE_POSITIONS;
  protected readonly lineVariant = ResizeControlVariant.Line;
  protected readonly handleVariant = ResizeControlVariant.Handle;

  private resizer = viewChild.required<TemplateRef<unknown>>('resizer');

  // Min/max read from the element's computed style; used as a fallback when no explicit input is given.
  private cssMinWidth = signal(0);
  private cssMinHeight = signal(0);
  private cssMaxWidth = signal(Infinity);
  private cssMaxHeight = signal(Infinity);

  protected effectiveMinWidth = computed(() => this.minWidth() ?? this.cssMinWidth());
  protected effectiveMinHeight = computed(() => this.minHeight() ?? this.cssMinHeight());
  protected effectiveMaxWidth = computed(() => this.maxWidth() ?? this.cssMaxWidth());
  protected effectiveMaxHeight = computed(() => this.maxHeight() ?? this.cssMaxHeight());

  /** `[vResizable]="false"` hides the controls but keeps the element as the node's sizing box. */
  protected readonly enabled = computed(() => this.vResizable() !== false);

  /** Explicit axes only; `null` while both axes follow the content. */
  protected readonly explicitSize = computed(() => {
    const width = this.model.explicitWidth();
    const height = this.model.explicitHeight();
    return width === undefined && height === undefined ? null : { width, height };
  });

  private registeredTemplate: TemplateRef<unknown> | null = null;

  protected emitResizeStart = (_: ResizeDragEvent, params: ResizeParams) =>
    this.resizeStart.emit({ ...params, node: this.model.rawNode });
  protected emitResize = (_: ResizeDragEvent, params: ResizeChangeParams) =>
    this.resize.emit({ ...params, node: this.model.rawNode });
  protected emitResizeEnd = (_: ResizeDragEvent, params: ResizeParams) =>
    this.resizeEnd.emit({ ...params, node: this.model.rawNode });

  public ngOnInit(): void {
    this.registeredTemplate = this.resizer();
    this.model.resizerTemplate.set(this.registeredTemplate);
  }

  public ngOnDestroy(): void {
    // A replacement element may already have registered its own controls.
    if (this.model.resizerTemplate() === this.registeredTemplate) {
      this.model.resizerTemplate.set(null);
    }
  }

  public ngAfterViewInit() {
    this.afService.batchAnimationFrame(() => {
      const style = getComputedStyle(this.hostRef.nativeElement);
      this.cssMinWidth.set(+style.minWidth.replace('px', '') || 0);
      this.cssMinHeight.set(+style.minHeight.replace('px', '') || 0);
      this.cssMaxWidth.set(+style.maxWidth.replace('px', '') || Infinity);
      this.cssMaxHeight.set(+style.maxHeight.replace('px', '') || Infinity);
    });
  }
}
