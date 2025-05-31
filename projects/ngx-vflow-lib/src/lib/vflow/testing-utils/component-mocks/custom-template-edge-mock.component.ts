import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsInterface } from '../types';
import type { CustomTemplateEdgeComponent } from '../../public-components/custom-template-edge/custom-template-edge.component';

@Component({
  selector: 'g[customTemplateEdge]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomTemplateEdgeMockComponent implements AsInterface<CustomTemplateEdgeComponent> {}
