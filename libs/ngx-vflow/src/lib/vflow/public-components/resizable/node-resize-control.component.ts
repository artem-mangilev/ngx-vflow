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
import { GeometryPipelineService } from '../../services/geometry-pipeline.service';
import { GeometryChange, GestureSession } from '../../features/geometry-intent.interface';
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
  },
})
export class NodeResizeControlComponent implements OnDestroy {
  private nodeAccessor = inject(NodeAccessorService);
  private viewportService = inject(ViewportService);
  private pipeline = inject(GeometryPipelineService);
  /** The resize session in progress; one per gesture that produced a change. */
  private session: GestureSession | null = null;
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
      nodeOrigin: [0, 0],
      paneDomNode: this.hostRef.nativeElement.closest('.vflow-pane'),
    }),
    // Every accepted change is a resize intent of one session: the pipeline's transforms see the node's new box and
    // the children's compensating positions together, and the pipeline writes them (turning the node explicit first).
    onChange: (change, childChanges) => {
      const model = this.model;
      const session = (this.session ??= this.beginSession());
      const target: GeometryChange = { id: model.rawNode.id };
      if (change.x !== undefined && change.y !== undefined) target.point = { x: change.x, y: change.y };
      if (change.width !== undefined) target.width = change.width;
      if (change.height !== undefined) target.height = change.height;
      const changes = [
        target,
        ...childChanges.map((child) => ({ id: child.model.rawNode.id, point: { ...child.position } })),
      ];
      this.pipeline.run({ kind: 'resize', phase: 'update', session, origin: 'core', changes });
    },
    onEnd: () => this.endSession(),
  });

  private beginSession(): GestureSession {
    const model = this.model;
    const session = this.pipeline.createSession('resizer', model.rawNode.id, [
      model.rawNode.id,
      ...model.children().map((child) => child.rawNode.id),
    ]);
    // During the gesture the resizer owns the size; measurement waits until it ends.
    model.resizing.set(true);
    this.pipeline.beginSession(session);
    return session;
  }

  private endSession(): void {
    const session = this.session;
    if (!session) return;
    this.session = null;
    const model = this.model;
    const changes: GeometryChange[] = [
      { id: model.rawNode.id, point: { ...model.point() }, width: model.width(), height: model.height() },
      ...this.pipeline.currentGeometry(session).filter((change) => change.id !== model.rawNode.id),
    ];
    if (!this.pipeline.run({ kind: 'resize', phase: 'end', session, origin: 'core', changes })) {
      const initial = session.initial.get(model.rawNode.id);
      this.pipeline.apply([
        ...(initial ? [{ id: model.rawNode.id, width: initial.width, height: initial.height }] : []),
        ...this.pipeline.initialGeometry(session),
      ]);
    }
    model.resizing.set(false);
    this.pipeline.endSession();
  }

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
