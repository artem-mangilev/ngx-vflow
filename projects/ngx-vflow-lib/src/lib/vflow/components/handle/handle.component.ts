import { Component, ElementRef, Injector, Input, NgZone, OnDestroy, OnInit, inject, runInInjectionContext, signal } from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { InjectionContext, WithInjectorDirective } from '../../decorators/run-in-injection-context.decorator';

@Component({
  selector: 'handle',
  templateUrl: './handle.component.html'
})
export class HandleComponent extends WithInjectorDirective implements OnInit, OnDestroy {
  private handleService = inject(HandleService)
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement

  /**
   * At what side of node this component should be placed
   */
  @Input({ required: true })
  public position!: Position

  /**
   * Source or target
   */
  @Input({ required: true })
  public type!: 'source' | 'target'

  /**
   * Should be used if node has more than one source/target
   */
  @Input()
  public id?: string

  public model!: HandleModel

  @InjectionContext
  public ngOnInit() {
    this.model = new HandleModel(
      {
        position: this.position,
        type: this.type,
        id: this.id,
        parentReference: this.element.parentElement!
      },
      this.handleService.node()!
    )

    this.handleService.createHandle(this.model)

    queueMicrotask(() => this.model.updateParent())
  }

  public ngOnDestroy(): void {
    this.handleService.destroyHandle(this.model)
  }
}

