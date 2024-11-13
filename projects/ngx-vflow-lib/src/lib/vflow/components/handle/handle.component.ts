import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, Input, OnDestroy, OnInit, TemplateRef, inject, runInInjectionContext, signal } from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { InjectionContext, WithInjector } from '../../decorators/run-in-injection-context.decorator';

@Component({
  selector: 'handle',
  templateUrl: './handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HandleComponent implements OnInit, WithInjector {
  public injector = inject(Injector);
  private handleService = inject(HandleService)
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
  private destroyRef = inject(DestroyRef)

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

  @Input()
  public template?: TemplateRef<any>

  public model!: HandleModel

  @InjectionContext
  public ngOnInit() {
    const node = this.handleService.node()

    if (node) {
      this.model = new HandleModel(
        {
          position: this.position,
          type: this.type,
          id: this.id,
          parentReference: this.element.parentElement!,
          template: this.template
        },
        node
      )

      this.handleService.createHandle(this.model)

      requestAnimationFrame(() => this.model.updateParent())

      this.destroyRef.onDestroy(() => this.handleService.destroyHandle(this.model))
    }
  }
}

