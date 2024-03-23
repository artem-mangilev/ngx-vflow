import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category'
import { DefaultNodesDemoComponent } from './demo/default-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `Default nodes`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { DefaultNodesDemoComponent },
  order: 1
};

export default TestPage;
