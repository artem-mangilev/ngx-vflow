import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { DefaultConnectionDemoComponent } from './demo/default-connection-demo.component';
import { LooseConnectionDemoComponent } from './demo/loose-connection-demo.component';

const TestPage: NgDocPage = {
  title: `Connection`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DefaultConnectionDemoComponent, LooseConnectionDemoComponent },
  order: 3,
};

export default TestPage;
