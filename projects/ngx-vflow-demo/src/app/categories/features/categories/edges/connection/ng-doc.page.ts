import { NgDocPage } from '@ng-doc/core';
import EdgesCategory from '../ng-doc.category';
import { DefaultConnectionDemoComponent } from './demo/default-connection-demo.component';
import { LooseConnectionDemoComponent } from './demo/loose-connection-demo.component';

const TestPage: NgDocPage = {
  title: `Connection`,
  mdFile: './index.md',
  category: EdgesCategory,
  demos: { DefaultConnectionDemoComponent, LooseConnectionDemoComponent },
  order: 2,
};

export default TestPage;
