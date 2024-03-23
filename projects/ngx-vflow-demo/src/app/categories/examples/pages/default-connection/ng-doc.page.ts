import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { DefaultConnectionDemoComponent } from './demo/default-connection-demo.component';

const TestPage: NgDocPage = {
  title: `Default connection`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DefaultConnectionDemoComponent },
  order: 3
};

export default TestPage;
