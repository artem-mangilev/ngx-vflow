import { Injectable, inject, computed } from '@angular/core';
import { ViewportState } from '../interfaces/viewport.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyboardService } from './keyboard.service';
import { FlowSettingsService } from './flow-settings.service';
import { SelectionStrategy } from '../interfaces/selection-strategy.interface';
import { SelectionMode } from '../types/selection-mode.type';
import { DefaultSelectionStrategy } from '../strategies/default-selection.strategy';
import { ManualSelectionStrategy } from '../strategies/manual-selection.strategy';

export interface ViewportForSelection {
  start: ViewportState;
  end: ViewportState;
  /**
   * Target may not exist if viewport change made programmatically
   */
  target?: Element;
}

@Injectable()
export class SelectionService {
  private static delta = 6;

  private flowEntitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);
  private flowSettingsService = inject(FlowSettingsService);

  private strategies: Record<SelectionMode, SelectionStrategy> = {
    default: new DefaultSelectionStrategy(),
    manual: new ManualSelectionStrategy(),
  };

  private currentStrategy = computed(() => this.strategies[this.flowSettingsService.selectionMode()]);

  protected viewport$ = new Subject<ViewportForSelection>();

  protected viewportChangeSub = this.viewport$
    .pipe(
      tap(({ start, end, target }) => {
        if (start && end && target) {
          this.currentStrategy().handleViewportChange(
            { start, end, target, delta: SelectionService.delta },
            {
              entities: this.flowEntitiesService.entities(),
              isMultiSelectionActive: this.keyboardService.isActiveAction('multiSelection'),
            },
          );
        }
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  public setViewport(viewport: ViewportForSelection) {
    this.viewport$.next(viewport);
  }

  public select(entity: FlowEntity | null) {
    this.currentStrategy().select(entity, {
      entities: this.flowEntitiesService.entities(),
      isMultiSelectionActive: this.keyboardService.isActiveAction('multiSelection'),
    });
  }
}
