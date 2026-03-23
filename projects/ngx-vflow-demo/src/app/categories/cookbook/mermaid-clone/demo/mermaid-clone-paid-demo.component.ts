import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaidIframeComponent } from '../../../../shared/components/paid-iframe/paid-iframe.component';

@Component({
  template: `
    <ngx-vflow-paid-iframe src="https://vflow-studio.com/mermaid-clone?showHeader=false" title="Mermaid Clone demo" />
  `,
  imports: [PaidIframeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MermaidClonePaidDemoComponent {}
