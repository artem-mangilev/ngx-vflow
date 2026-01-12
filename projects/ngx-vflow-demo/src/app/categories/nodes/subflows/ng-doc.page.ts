import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { SubflowsDemoComponent } from './demo/subflows-demo.component';

const TestPage: NgDocPage = {
  title: `Subflows`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { SubflowsDemoComponent },
  order: 3,
};

export default TestPage;
