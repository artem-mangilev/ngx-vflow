import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreeManagerService } from '../../services/tree-manager.service';

@Component({
  selector: '[vdoc-root]',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./vdoc-root.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TreeManagerService]
})
export class VDocRootComponent { }
