import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../../ng-doc.category';
import { AlignmentHelperDemoComponent } from './demo/alignment-helper-demo.component';

const TestPage: NgDocPage = {
  title: `Alignment Helper`,
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { AlignmentHelperDemoComponent },
  order: 5,
};

export default TestPage;
