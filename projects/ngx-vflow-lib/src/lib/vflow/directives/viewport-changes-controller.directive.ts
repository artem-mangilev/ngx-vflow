import { Directive, inject } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { ViewportService } from '../services/viewport.service';

@Directive()
export class ViewportChangesControllerDirective {
  private viewportService = inject(ViewportService);

  public readonly viewportChanges = outputFromObservable(this.viewportService.viewportChange$);

  public readonly viewportChangesStart = outputFromObservable(this.viewportService.viewportChangeStart$, {
    alias: 'viewportChanges.start',
  });

  public readonly viewportChangesEnd = outputFromObservable(this.viewportService.viewportChangeEnd$, {
    alias: 'viewportChanges.end',
  });
}
