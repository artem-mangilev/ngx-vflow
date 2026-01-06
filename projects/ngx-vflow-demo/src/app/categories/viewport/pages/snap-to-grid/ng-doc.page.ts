import { NgDocPage } from '@ng-doc/core';
import ViewportCategory from '../../ng-doc.category';
import { SubflowsDemoComponent } from './demo/subflows-demo.component';

const TestPage: NgDocPage = {
  title: `Snap to Grid`,
  mdFile: './index.md',
  category: ViewportCategory,
  demos: { SubflowsDemoComponent },
  order: 4,
};

export default TestPage;
