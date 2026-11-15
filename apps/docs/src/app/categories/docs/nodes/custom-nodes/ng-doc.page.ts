import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { CustomNodesDemoComponent } from './demo/custom-nodes-demo.component';
import { CustomComponentNodesDemoComponent } from './demo/custom-component-nodes-demo.component';
import { DefaultNodesDemoComponent } from './demo/default-nodes-demo.component';

const TestPage: NgDocPage = {
  title: 'Custom nodes',
  mdFile: './index.md',
  category: NodesCategory,
  demos: { CustomNodesDemoComponent, CustomComponentNodesDemoComponent, DefaultNodesDemoComponent },
  order: 1,
};

export default TestPage;
