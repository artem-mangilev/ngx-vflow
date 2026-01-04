import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { ReconnectionDemoComponent } from './demo/reconnection-demo.component';

const TestPage: NgDocPage = {
  title: `Reconnect Edge`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { ReconnectionDemoComponent },
  order: 6,
};

export default TestPage;
