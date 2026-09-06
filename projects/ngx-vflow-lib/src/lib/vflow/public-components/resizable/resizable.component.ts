import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { RequestAnimationFrameBatchingService } from '../../services/request-animation-frame-batching.service';
import { NodeResizeControlComponent } from './node-resize-control.component';
import {
  ControlLinePosition,
  ControlPosition,
  RESIZER_HANDLE_POSITIONS,
  RESIZER_LINE_POSITIONS,
  ResizeControlDirection,
  ResizeControlVariant,
  ResizeDragEvent,
  ResizeParams,
  ResizeParamsWithDirection,
  ShouldResize,
} from './resizer-types';

/**
 * Adds resize controls (four lines + four corner handles) to a node. The controls
 * mutate the node dimensions/position through a d3-drag based resize engine.
 */
@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss'],
  imports: [NodeResizeControlComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableComponent implements OnInit, AfterViewInit, OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private afService = inject(RequestAnimationFrameBatchingService);

  public resizable = input<boolean | ''>();

  public resizerColor = input('#2e414c');

  public gap = input(1.5);

  public minWidth = input<number>();
  public minHeight = input<number>();
  public maxWidth = input<number>();
  public maxHeight = input<number>();

  public keepAspectRatio = input(false);

  public resizeDirection = input<ResizeControlDirection>();

  public autoScale = input(true);

  public readonly resizeStart = output<ResizeParams>();
  public readonly resizeChange = output<ResizeParamsWithDirection>();
  public readonly resizeEnd = output<ResizeParams>();
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

  protected get model() {
    return this.nodeAccessor.model()!;
  }

  protected emitResizeStart = (_: ResizeDragEvent, params: ResizeParams) => this.resizeStart.emit(params);
  protected emitResize = (_: ResizeDragEvent, params: ResizeParamsWithDirection) => this.resizeChange.emit(params);
  protected emitResizeEnd = (_: ResizeDragEvent, params: ResizeParams) => this.resizeEnd.emit(params);

  constructor() {
    effect(() => {
      const resizable = this.resizable();
      this.model.resizable.set(typeof resizable === 'boolean' ? resizable : true);
    });
  }

  public ngOnInit(): void {
    this.model.controlledByResizer.set(true);
    this.model.resizerTemplate.set(this.resizer());
  }

  public ngOnDestroy(): void {
    this.model.controlledByResizer.set(false);
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
