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
  runInInjectionContext,
} from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';
import { OffsetBatchingCacheService } from '../../services/offset-batching-cache.service';
import { RequestAnimationFrameBatchingService } from '../../services/request-animation-frame-batching.service';

@Component({
  standalone: true,
  selector: 'handle',
  templateUrl: './handle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandleComponent implements OnInit {
  private injector = inject(Injector);
  private handleService = inject(HandleService);
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private destroyRef = inject(DestroyRef);
  private requestAnimationFrameBatchingService = inject(RequestAnimationFrameBatchingService);
  private offsetBatchingCacheService = inject(OffsetBatchingCacheService);

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

  public template = input<TemplateRef<any> | null>();

  public offsetX = input<number>(0);
  public offsetY = input<number>(0);

  public ngOnInit() {
    runInInjectionContext(this.injector, () => {
      const node = this.handleService.node();

      if (node) {
        const model = new HandleModel(
          {
            position: this.position(),
            type: this.type(),
            id: this.id(),

            hostReference: this.element.parentElement!,
            template: this.template(),
            userOffsetX: this.offsetX(),
            userOffsetY: this.offsetY(),
          },
          node,
          this.offsetBatchingCacheService,
        );

        this.handleService.createHandle(model);

        this.requestAnimationFrameBatchingService.batchAnimationFrame(() => {
          model.updateHost();
        });

        this.destroyRef.onDestroy(() => {
          this.handleService.destroyHandle(model);
          model.onDestroy();
        });
      }
    });
  }
}
