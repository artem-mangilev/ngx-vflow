import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { DocsKit } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

export interface RequestData {
  title: string;
  amount: number;
}

/** An expense request. It reads its node with `injectNode()` and tells the flow when it is submitted. */
@Component({
  template: `
    <article vuiNode class="w-52 text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>{{ node.data().title }}</span>
        <span vuiMeta>{{ node.data().amount | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
      </header>
      <footer vuiNodeFooter>
        <button docsButton="primary" small type="button" vNoDrag (click)="submitted.emit(node.data())">Submit</button>
      </footer>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vflow, Vui, DocsKit, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestNodeComponent {
  protected readonly node = injectNode<RequestData>();

  readonly submitted = output<RequestData>();
}
