import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  input,
  viewChild,
  effect,
  forwardRef,
  NgZone,
  DestroyRef,
} from '@angular/core';
import { Directive } from '@angular/core';
import { Position } from '../../types/position.type';
import { ToolbarModel } from '../../models/toolbar.model';
import { OverlaysService } from '../../services/overlays.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { resizable } from '../../utils/resizable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'node-toolbar',
  template: `
    <ng-template #toolbar>
      <div class="wrapper" nodeToolbarWrapper [model]="model">
        <ng-content />
      </div>
    </ng-template>
  `,
  styles: [
    `
      .wrapper {
        width: max-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [forwardRef(() => NodeToolbarWrapperDirective)],
})
export class NodeToolbarComponent implements OnInit, OnDestroy {
  private overlaysService = inject(OverlaysService);
  private nodeService = inject(NodeAccessorService);

  public position = input<Position>('top');

  protected toolbarContentTemplate = viewChild.required<TemplateRef<unknown>>('toolbar');

  protected model = new ToolbarModel(this.nodeService.model()!);

  constructor() {
    effect(() => this.model.position.set(this.position()), { allowSignalWrites: true });
  }

  public ngOnInit(): void {
    this.model.template.set(this.toolbarContentTemplate());

    this.overlaysService.addToolbar(this.model);
  }

  public ngOnDestroy(): void {
    this.overlaysService.removeToolbar(this.model);
  }
}

@Directive({
  selector: '[nodeToolbarWrapper]',
  standalone: true,
})
export class NodeToolbarWrapperDirective implements OnInit {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  public model = input.required<ToolbarModel>();

  public ngOnInit(): void {
    resizable([this.element.nativeElement], this.zone)
      .pipe(
        tap(() => this.setSize()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private setSize() {
    this.model().size.set({
      width: this.element.nativeElement.clientWidth,
      height: this.element.nativeElement.clientHeight,
    });
  }
}
