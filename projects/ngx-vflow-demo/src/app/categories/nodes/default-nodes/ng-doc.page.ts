import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { DefaultNodesDemoComponent } from './demo/default-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `Default nodes`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { DefaultNodesDemoComponent },
  order: 1,
};

export default TestPage;
