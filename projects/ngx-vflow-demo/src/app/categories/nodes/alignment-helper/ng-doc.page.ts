import { NgDocPage } from '@ng-doc/core';
import NodesCategory from '../ng-doc.category';
import { AlignmentHelperDemoComponent } from './demo/alignment-helper-demo.component';

const TestPage: NgDocPage = {
  title: `Alignment Helper`,
  mdFile: './index.md',
  category: NodesCategory,
  demos: { AlignmentHelperDemoComponent },
  order: 3,
};

export default TestPage;
