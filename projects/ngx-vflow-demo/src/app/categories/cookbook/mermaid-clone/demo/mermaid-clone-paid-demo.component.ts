import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaidIframeComponent } from '../../../../shared/components/paid-iframe/paid-iframe.component';

@Component({
  template: ` <ngx-vflow-paid-iframe src="https://vflow-studio.com/embed/mermaid-clone" title="Mermaid Clone demo" /> `,
  imports: [PaidIframeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MermaidClonePaidDemoComponent {}
