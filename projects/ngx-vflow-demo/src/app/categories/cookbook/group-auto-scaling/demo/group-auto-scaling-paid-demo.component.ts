import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaidIframeComponent } from '../../../../shared/components/paid-iframe/paid-iframe.component';

@Component({
  template: `
    <ngx-vflow-paid-iframe
      src="https://vflow-studio.com/group-auto-scaling?showHeader=false"
      title="Group Auto Scaling demo" />
  `,
  imports: [PaidIframeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupAutoScalingPaidDemoComponent {}
