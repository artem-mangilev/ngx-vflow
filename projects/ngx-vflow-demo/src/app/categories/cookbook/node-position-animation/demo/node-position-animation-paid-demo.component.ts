import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaidIframeComponent } from '../../../../shared/components/paid-iframe/paid-iframe.component';

@Component({
  template: `
    <ngx-vflow-paid-iframe
      src="https://vflow-studio.com/embed/node-position-animation"
      title="Node Position Animation demo" />
  `,
  imports: [PaidIframeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePositionAnimationPaidDemoComponent {}
