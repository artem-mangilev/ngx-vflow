import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { SvgNodesDemoComponent } from './demo/svg-nodes-demo.component';

const TestPage: NgDocPage = {
  title: `SVG Nodes`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { SvgNodesDemoComponent },
};

export default TestPage;
