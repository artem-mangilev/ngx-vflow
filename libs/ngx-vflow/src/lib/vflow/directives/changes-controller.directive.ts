import { Directive, inject } from '@angular/core';
import { EdgeChangesService } from '../services/edge-changes.service';
import { NodesChangeService } from '../services/node-changes.service';
import { outputFromObservable } from '@angular/core/rxjs-interop';

/**
 * The changes of one type as separate outputs. `(nodesChanges)` and `(edgesChanges)` with every type belong to the
 * flow component itself.
 */
@Directive()
export class ChangesControllerDirective {
  protected nodesChangeService = inject(NodesChangeService);
  protected edgesChangeService = inject(EdgeChangesService);

  public readonly nodesChangesPosition = outputFromObservable(this.nodesChangeService.changesOfType('position'), {
    alias: 'nodesChanges.position',
  });

  public readonly nodesChangesSize = outputFromObservable(this.nodesChangeService.changesOfType('size'), {
    alias: 'nodesChanges.size',
  });

  public readonly nodesChangesAdd = outputFromObservable(this.nodesChangeService.changesOfType('add'), {
    alias: 'nodesChanges.add',
  });

  public readonly nodesChangesRemove = outputFromObservable(this.nodesChangeService.changesOfType('remove'), {
    alias: 'nodesChanges.remove',
  });

  public readonly nodesChangesSelect = outputFromObservable(this.nodesChangeService.changesOfType('select'), {
    alias: 'nodesChanges.select',
  });

  public readonly edgesChangesDetached = outputFromObservable(this.edgesChangeService.changesOfType('detached'), {
    alias: 'edgesChanges.detached',
  });

  public readonly edgesChangesAdd = outputFromObservable(this.edgesChangeService.changesOfType('add'), {
    alias: 'edgesChanges.add',
  });

  public readonly edgesChangesRemove = outputFromObservable(this.edgesChangeService.changesOfType('remove'), {
    alias: 'edgesChanges.remove',
  });

  public readonly edgesChangesSelect = outputFromObservable(this.edgesChangeService.changesOfType('select'), {
    alias: 'edgesChanges.select',
  });
}
