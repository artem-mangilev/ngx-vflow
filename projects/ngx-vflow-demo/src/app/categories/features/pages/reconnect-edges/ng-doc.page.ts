import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { ReconnectionDemoComponent } from './demo/reconnection-demo.component';

const TestPage: NgDocPage = {
  title: `Reconnect Edge`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { ReconnectionDemoComponent },
  order: 3,
};

export default TestPage;
