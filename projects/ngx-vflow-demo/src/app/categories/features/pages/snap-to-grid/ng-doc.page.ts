import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../../ng-doc.category';
import { SubflowsDemoComponent } from './demo/subflows-demo.component';

const TestPage: NgDocPage = {
  title: `Snap to Grid`,
  mdFile: './index.md',
  category: ExamplesCategory,
  demos: { SubflowsDemoComponent },
};

export default TestPage;
