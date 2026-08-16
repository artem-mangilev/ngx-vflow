import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  runInInjectionContext,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { PointerDirective } from '../../directives/pointer.directive';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { FlowStatusService } from '../../services/flow-status.service';
import { HandleContext } from '../../interfaces/template-context.interface';

@Component({
  standalone: true,
  selector: 'handle',
  templateUrl: './handle.component.html',
  styleUrls: ['./handle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, PointerDirective],
})
export class HandleComponent implements OnInit, AfterViewInit {
  private injector = inject(Injector);
  private handleService = inject(HandleService);
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private destroyRef = inject(DestroyRef);
  private flowStatusService = inject(FlowStatusService);

  // TODO remove dependency from this directive
  private connectionController = inject(ConnectionControllerDirective, { optional: true });

  /**
   * At what side of node this component should be placed
   */
  public position = input.required<Position>();

  /**
   * Source or target
   */
  public type = input.required<'source' | 'target'>();

  /**
   * Should be used if node has more than one source/target
   */
  public id = input<string>();

  public template = input<TemplateRef<HandleContext> | null>();

  public offsetX = input<number>(0);
  public offsetY = input<number>(0);

  public canStart = input<boolean>(true);

  public canAccept = input<boolean>(true);

  private handleElementRef = viewChild<ElementRef<HTMLElement>>('handleElement');

  protected model: HandleModel | null = null;

  protected showMagnet = computed(
    () =>
      this.flowStatusService.status().state === 'connection-start' ||
      this.flowStatusService.status().state === 'connection-validation' ||
      this.flowStatusService.status().state === 'reconnection-start' ||
      this.flowStatusService.status().state === 'reconnection-validation',
  );

  public ngOnInit() {
    runInInjectionContext(this.injector, () => {
      const node = this.handleService.node();

      if (!node) {
        return;
      }

      // The anchor element determines where the handle sits along the node edge.
      // Positioning itself is relative to the node, same as xyflow handles.
      const parent = this.element.parentElement;

      const model = new HandleModel(
        {
          position: this.position(),
          type: this.type(),
          id: this.id(),

          hostReference: parent!,
          template: this.template(),
          userOffsetX: this.offsetX(),
          userOffsetY: this.offsetY(),
          canStart: this.canStart,
          canAccept: this.canAccept,
        },
        node,
      );

      this.model = model;
      this.handleService.createHandle(model);

      this.destroyRef.onDestroy(() => {
        this.handleService.destroyHandle(model);
      });
    });
  }

  public ngAfterViewInit() {
    const model = this.model;
    const handleElement = this.handleElementRef()?.nativeElement;

    if (!model || !handleElement) {
      return;
    }

    model.handleElement = handleElement;
  }

  protected startConnection(event: Event) {
    if (!this.model) {
      return;
    }

    // ignore drag by stopping propagation
    event.stopPropagation();

    this.connectionController?.startConnection(this.model);
  }

  protected endConnection() {
    this.connectionController?.endConnection();
  }

  protected validateConnection() {
    if (!this.model) {
      return;
    }

    this.connectionController?.validateConnection(this.model);
  }

  protected resetValidateConnection() {
    if (!this.model) {
      return;
    }

    this.connectionController?.resetValidateConnection(this.model);
  }
}
