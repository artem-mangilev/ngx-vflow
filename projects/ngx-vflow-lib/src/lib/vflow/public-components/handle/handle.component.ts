import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { InjectionContext, WithInjector } from '../../decorators/run-in-injection-context.decorator';

@Component({
  standalone: true,
  selector: 'handle',
  templateUrl: './handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandleComponent implements OnInit, WithInjector {
  public injector = inject(Injector);
  private handleService = inject(HandleService);
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private destroyRef = inject(DestroyRef);

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

  public template = input<TemplateRef<any>>();

  public model!: HandleModel;

  @InjectionContext
  public ngOnInit() {
    const node = this.handleService.node();

    if (node) {
      this.model = new HandleModel(
        {
          position: this.position(),
          type: this.type(),
          id: this.id(),
          hostReference: this.element.parentElement!,
          template: this.template(),
        },
        node,
      );

      this.handleService.createHandle(this.model);

      requestAnimationFrame(() => this.model.updateHost());

      this.destroyRef.onDestroy(() => this.handleService.destroyHandle(this.model));
    }
  }
}
