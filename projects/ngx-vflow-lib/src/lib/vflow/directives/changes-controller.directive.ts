import { Directive, EventEmitter, Output, effect, inject } from '@angular/core';
import { NodeChange } from '../types/node-change.type';
import { EdgeChange, EdgeChangesService } from '../services/edge-changes.service';
import { NodesChangeService } from '../services/node-changes.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[changesController]',
  standalone: true
})
export class ChangesControllerDirective {
  protected nodesChangeService = inject(NodesChangeService)
  protected edgesChangeService = inject(EdgeChangesService)

  @Output()
  public onNodesChange = new EventEmitter<NodeChange[]>()

  @Output()
  public onEdgesChange = new EventEmitter<EdgeChange[]>()

  protected nodesChangeProxySubscription = this.nodesChangeService.changes$
    .pipe(
      tap((changes) => this.onNodesChange.emit(changes)),
      takeUntilDestroyed()
    )
    .subscribe()

  protected edgesChangeProxySubscription = this.edgesChangeService.changes$
    .pipe(
      tap((changes) => this.onEdgesChange.emit(changes)),
      takeUntilDestroyed()
    )
    .subscribe()
}
