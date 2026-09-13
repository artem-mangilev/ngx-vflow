import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsInterface } from '../types';
import type { CustomEdgeComponent } from 'ngx-vflow';

@Component({
  selector: 'g[customEdge]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomEdgeMockComponent implements AsInterface<CustomEdgeComponent> {}
