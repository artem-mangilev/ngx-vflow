import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { NodeToolbarDemoComponent } from './demo/node-toolbar-demo.component';
import { MultipleNodeToolbarsDemoComponent } from './demo/multiple-node-toolbars-demo.component';

const TestPage: NgDocPage = {
  title: `Node toolbar`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { NodeToolbarDemoComponent, MultipleNodeToolbarsDemoComponent },
  order: 5,
};

export default TestPage;
