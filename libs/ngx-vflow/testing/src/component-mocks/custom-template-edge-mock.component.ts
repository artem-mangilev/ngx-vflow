import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsInterface } from '../types';
import type { CustomTemplateEdgeComponent } from 'ngx-vflow';

@Component({
  selector: 'g[customTemplateEdge]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomTemplateEdgeMockComponent implements AsInterface<CustomTemplateEdgeComponent> {}
